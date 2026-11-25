"""Browser bridge around the unmodified Crafter simulation and BALROG text.

This module runs inside Pyodide, never in a Python HTTP backend. Its small
reset/step shell mirrors CrafterLanguageWrapper, including its initial Noop
and the extra render performed while constructing each language observation.
"""
from __future__ import annotations

import json
import random

import crafter
import numpy as np

from balrog_crafter import ACTIONS, describe_frame, get_instruction_prompt
from public_prompt import public_prompt


world = None
world_frame = b""


def _native_world_seed(seed: int, episode: int) -> int:
    """Match 64-bit CPython's hash((seed, episode)) on WASM32 as well.

    Crafter 1.8.3 uses this tuple hash to initialize terrain randomness. The
    CPython 3.11/3.12 tuple algorithm is fixed here for two integer values;
    calling the browser's native hash would instead select a different world.
    """
    mask = (1 << 64) - 1
    prime1, prime2, prime5 = 11400714785074694791, 14029467366897019727, 2870177450012600261
    accumulator = prime5
    for value in (seed, episode):
        lane = abs(value) % ((1 << 61) - 1)
        if value < 0:
            lane = -lane
        if lane == -1:
            lane = -2
        accumulator = (accumulator + (lane & mask) * prime2) & mask
        accumulator = ((accumulator << 31) | (accumulator >> 33)) & mask
        accumulator = (accumulator * prime1) & mask
    accumulator = (accumulator + (2 ^ (prime5 ^ 3527539))) & mask
    hashed = 1546275796 if accumulator == mask else (
        accumulator - (1 << 64) if accumulator >= 1 << 63 else accumulator)
    return hashed % (2**31 - 1)


class _CrafterWithNativeSeeds(crafter.Env):
    def reset(self):
        # Upstream reset has no seed-derivation hook. Intercept only this world's
        # RNG reset for the duration of the original method; retain every game,
        # rendering and episode-counter operation in the pinned upstream code.
        game = self._world
        original_reset = game.reset
        terrain_seed = _native_world_seed(int(self._seed), int(self._episode) + 1)
        previous_override = game.__dict__.get("reset")
        game.reset = lambda seed=None: original_reset(terrain_seed)
        try:
            return super().reset()
        finally:
            if previous_override is None:
                del game.reset
            else:
                game.reset = previous_override


class BrowserWorld:
    def __init__(self, seed: int):
        if not 0 <= seed < 2**31:
            raise ValueError("Choose a seed from 0 to 2147483647")
        random.seed(seed)
        np.random.seed(seed)
        self.seed = seed
        # The native rollout allows 2,000 decisions after BALROG's initial Noop.
        self.env = _CrafterWithNativeSeeds(area=(64, 64), view=(9, 9), size=(256, 256),
                                          reward=True, length=2001, seed=seed)
        self.history = []
        self.steps = 0
        self.done = False
        self.instructions = get_instruction_prompt().strip()
        self.env.reset()
        # BALROG's reset advances one Noop before constructing its observation.
        _, _, _, info = self.env.step(0)
        self._observe(info)

    def _observe(self, info):
        augmented = dict(info, sleeping=self.env._player.sleeping,
                         player_facing=self.env._player.facing,
                         dead=self.env._player.health <= 0, view=self.env._view)
        long_context, short_context = describe_frame(
            augmented, unique_items=True, precise_location=False,
            skip_items=[], edge_only_items=[])
        self.text = {"long_term_context": long_context, "short_term_context": short_context}
        self.info = info
        # Reuse this rendered frame in the browser; no extra render is requested
        # by the UI, because the renderer also consumes the game's random state.
        self.image = np.asarray(self.env.render(), dtype=np.uint8)

    def step(self, candidate: str):
        if self.done:
            raise RuntimeError("This world has ended. Start a new world to continue.")
        action = candidate if candidate in ACTIONS else "Noop"
        self.history.append({"text": dict(self.text), "action": action})
        self.history = self.history[-4:]
        _, reward, self.done, info = self.env.step(ACTIONS.index(action))
        self.steps += 1
        self._observe(info)
        if action != candidate:
            self.text["long_term_context"] = (
                f"\n\nYour previous output did not contain a valid action. Defaulted to action: {action}\n\nObservation:\n"
                + self.text["long_term_context"])
        return self.snapshot(action, float(reward), action != candidate)

    def snapshot(self, action=None, reward=0.0, invalid=False):
        global world_frame
        alpha = np.full((*self.image.shape[:2], 1), 255, dtype=np.uint8)
        world_frame = np.ascontiguousarray(np.concatenate([self.image, alpha], axis=-1)).tobytes()
        achievements = {key: int(value) for key, value in self.info["achievements"].items()}
        return {
            "type": "world", "text": self.text, "history": self.history,
            "instructions": self.instructions, "actions": ACTIONS,
            "prompt": public_prompt(self.instructions, self.text, self.history),
            "width": int(self.image.shape[1]), "height": int(self.image.shape[0]),
            "action": action, "reward": reward, "done": bool(self.done), "invalid": invalid,
            "stats": {"seed": self.seed, "steps": self.steps,
                      "score": sum(value > 0 for value in achievements.values()),
                      "achievements": achievements,
                      "inventory": {key: int(value) for key, value in self.info["inventory"].items()}},
        }


def world_dispatch(message_json: str) -> str:
    global world
    message = json.loads(message_json)
    command = message["type"]
    if command in {"init", "reset"}:
        world = BrowserWorld(int(message.get("seed", 103000000)))
        result = world.snapshot()
    elif command == "step":
        if world is None:
            raise RuntimeError("Initialize a world before taking an action")
        result = world.step(str(message["action"]))
    else:
        raise ValueError(f"Unknown world command: {command}")
    return json.dumps(result)
