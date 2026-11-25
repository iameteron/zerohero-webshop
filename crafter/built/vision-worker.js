var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs
var He = Object.defineProperty;
var An = Object.getOwnPropertyDescriptor;
var On = Object.getOwnPropertyNames;
var In = Object.prototype.hasOwnProperty;
var je = ((e) => typeof __require < "u" ? __require : typeof Proxy < "u" ? new Proxy(e, { get: (t, n) => (typeof __require < "u" ? __require : t)[n] }) : e)(function(e) {
  if (typeof __require < "u") return __require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var E = (e, t) => () => (e && (t = e(e = 0)), t);
var Ve = (e, t) => {
  for (var n in t) He(e, n, { get: t[n], enumerable: true });
};
var Pn = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function") for (let r of On(t)) !In.call(e, r) && r !== n && He(e, r, { get: () => t[r], enumerable: !(o = An(t, r)) || o.enumerable });
  return e;
};
var lt = (e) => Pn(He({}, "__esModule", { value: true }), e);
var be;
var Y;
var ce;
var xn;
var pt;
var Ye = E(() => {
  "use strict";
  be = /* @__PURE__ */ new Map(), Y = [], ce = (e, t, n) => {
    if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
      let o = be.get(e);
      if (o === void 0) be.set(e, { backend: t, priority: n });
      else {
        if (o.priority > n) return;
        if (o.priority === n && o.backend !== t) throw new Error(`cannot register backend "${e}" using priority ${n}`);
      }
      if (n >= 0) {
        let r = Y.indexOf(e);
        r !== -1 && Y.splice(r, 1);
        for (let i = 0; i < Y.length; i++) if (be.get(Y[i]).priority <= n) {
          Y.splice(i, 0, e);
          return;
        }
        Y.push(e);
      }
      return;
    }
    throw new TypeError("not a valid backend");
  }, xn = async (e) => {
    let t = be.get(e);
    if (!t) return "backend not found.";
    if (t.initialized) return t.backend;
    if (t.aborted) return t.error;
    {
      let n = !!t.initPromise;
      try {
        return n || (t.initPromise = t.backend.init(e)), await t.initPromise, t.initialized = true, t.backend;
      } catch (o) {
        return n || (t.error = `${o}`, t.aborted = true), t.error;
      } finally {
        delete t.initPromise;
      }
    }
  }, pt = async (e) => {
    let t = e.executionProviders || [], n = t.map((u) => typeof u == "string" ? u : u.name), o = n.length === 0 ? Y : n, r, i = [], a = /* @__PURE__ */ new Set();
    for (let u of o) {
      let f = await xn(u);
      typeof f == "string" ? i.push({ name: u, err: f }) : (r || (r = f), r === f && a.add(u));
    }
    if (!r) throw new Error(`no available backend found. ERR: ${i.map((u) => `[${u.name}] ${u.err}`).join(", ")}`);
    for (let { name: u, err: f } of i) n.includes(u) && console.warn(`removing requested execution provider "${u}" from session options because it is not available: ${f}`);
    let s = t.filter((u) => a.has(typeof u == "string" ? u : u.name));
    return [r, new Proxy(e, { get: (u, f) => f === "executionProviders" ? s : Reflect.get(u, f) })];
  };
});
var mt = E(() => {
  "use strict";
  Ye();
});
var wt;
var ht = E(() => {
  "use strict";
  wt = "1.22.0";
});
var yt;
var C;
var qe = E(() => {
  "use strict";
  ht();
  yt = "warning", C = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: wt }, set logLevel(e) {
    if (e !== void 0) {
      if (typeof e != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(e) === -1) throw new Error(`Unsupported logging level: ${e}`);
      yt = e;
    }
  }, get logLevel() {
    return yt;
  } };
  Object.defineProperty(C, "logLevel", { enumerable: true });
});
var I;
var bt = E(() => {
  "use strict";
  qe();
  I = C;
});
var gt;
var Et;
var Tt = E(() => {
  "use strict";
  gt = (e, t) => {
    let n = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
    n.width = e.dims[3], n.height = e.dims[2];
    let o = n.getContext("2d");
    if (o != null) {
      let r, i;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (r = e.dims[2], i = e.dims[3]) : (r = e.dims[3], i = e.dims[2]);
      let a = t?.format !== void 0 ? t.format : "RGB", s = t?.norm, u, f;
      s === void 0 || s.mean === void 0 ? u = [255, 255, 255, 255] : typeof s.mean == "number" ? u = [s.mean, s.mean, s.mean, s.mean] : (u = [s.mean[0], s.mean[1], s.mean[2], 0], s.mean[3] !== void 0 && (u[3] = s.mean[3])), s === void 0 || s.bias === void 0 ? f = [0, 0, 0, 0] : typeof s.bias == "number" ? f = [s.bias, s.bias, s.bias, s.bias] : (f = [s.bias[0], s.bias[1], s.bias[2], 0], s.bias[3] !== void 0 && (f[3] = s.bias[3]));
      let c = i * r, l = 0, d = c, p = c * 2, w = -1;
      a === "RGBA" ? (l = 0, d = c, p = c * 2, w = c * 3) : a === "RGB" ? (l = 0, d = c, p = c * 2) : a === "RBG" && (l = 0, p = c, d = c * 2);
      for (let b = 0; b < i; b++) for (let O = 0; O < r; O++) {
        let m = (e.data[l++] - f[0]) * u[0], h = (e.data[d++] - f[1]) * u[1], P = (e.data[p++] - f[2]) * u[2], g = w === -1 ? 255 : (e.data[w++] - f[3]) * u[3];
        o.fillStyle = "rgba(" + m + "," + h + "," + P + "," + g + ")", o.fillRect(O, b, 1, 1);
      }
      if ("toDataURL" in n) return n.toDataURL();
      throw new Error("toDataURL is not supported");
    } else throw new Error("Can not access image data");
  }, Et = (e, t) => {
    let n = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), o;
    if (n != null) {
      let r, i, a;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (r = e.dims[2], i = e.dims[1], a = e.dims[3]) : (r = e.dims[3], i = e.dims[2], a = e.dims[1]);
      let s = t !== void 0 && t.format !== void 0 ? t.format : "RGB", u = t?.norm, f, c;
      u === void 0 || u.mean === void 0 ? f = [255, 255, 255, 255] : typeof u.mean == "number" ? f = [u.mean, u.mean, u.mean, u.mean] : (f = [u.mean[0], u.mean[1], u.mean[2], 255], u.mean[3] !== void 0 && (f[3] = u.mean[3])), u === void 0 || u.bias === void 0 ? c = [0, 0, 0, 0] : typeof u.bias == "number" ? c = [u.bias, u.bias, u.bias, u.bias] : (c = [u.bias[0], u.bias[1], u.bias[2], 0], u.bias[3] !== void 0 && (c[3] = u.bias[3]));
      let l = i * r;
      if (t !== void 0 && (t.format !== void 0 && a === 4 && t.format !== "RGBA" || a === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
      let d = 4, p = 0, w = 1, b = 2, O = 3, m = 0, h = l, P = l * 2, g = -1;
      s === "RGBA" ? (m = 0, h = l, P = l * 2, g = l * 3) : s === "RGB" ? (m = 0, h = l, P = l * 2) : s === "RBG" && (m = 0, P = l, h = l * 2), o = n.createImageData(r, i);
      for (let S = 0; S < i * r; p += d, w += d, b += d, O += d, S++) o.data[p] = (e.data[m++] - c[0]) * f[0], o.data[w] = (e.data[h++] - c[1]) * f[1], o.data[b] = (e.data[P++] - c[2]) * f[2], o.data[O] = g === -1 ? 255 : (e.data[g++] - c[3]) * f[3];
    } else throw new Error("Can not access image data");
    return o;
  };
});
var Je;
var St;
var At;
var Ot;
var It;
var Pt;
var xt = E(() => {
  "use strict";
  ge();
  Je = (e, t) => {
    if (e === void 0) throw new Error("Image buffer must be defined");
    if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
    if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
    let { height: n, width: o } = t, r = t.norm ?? { mean: 255, bias: 0 }, i, a;
    typeof r.mean == "number" ? i = [r.mean, r.mean, r.mean, r.mean] : i = [r.mean[0], r.mean[1], r.mean[2], r.mean[3] ?? 255], typeof r.bias == "number" ? a = [r.bias, r.bias, r.bias, r.bias] : a = [r.bias[0], r.bias[1], r.bias[2], r.bias[3] ?? 0];
    let s = t.format !== void 0 ? t.format : "RGBA", u = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", f = n * o, c = u === "RGBA" ? new Float32Array(f * 4) : new Float32Array(f * 3), l = 4, d = 0, p = 1, w = 2, b = 3, O = 0, m = f, h = f * 2, P = -1;
    s === "RGB" && (l = 3, d = 0, p = 1, w = 2, b = -1), u === "RGBA" ? P = f * 3 : u === "RBG" ? (O = 0, h = f, m = f * 2) : u === "BGR" && (h = 0, m = f, O = f * 2);
    for (let S = 0; S < f; S++, d += l, w += l, p += l, b += l) c[O++] = (e[d] + a[0]) / i[0], c[m++] = (e[p] + a[1]) / i[1], c[h++] = (e[w] + a[2]) / i[2], P !== -1 && b !== -1 && (c[P++] = (e[b] + a[3]) / i[3]);
    return u === "RGBA" ? new U("float32", c, [1, 4, n, o]) : new U("float32", c, [1, 3, n, o]);
  }, St = async (e, t) => {
    let n = typeof HTMLImageElement < "u" && e instanceof HTMLImageElement, o = typeof ImageData < "u" && e instanceof ImageData, r = typeof ImageBitmap < "u" && e instanceof ImageBitmap, i = typeof e == "string", a, s = t ?? {}, u = () => {
      if (typeof document < "u") return document.createElement("canvas");
      if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
      throw new Error("Canvas is not supported");
    }, f = (c) => typeof HTMLCanvasElement < "u" && c instanceof HTMLCanvasElement || c instanceof OffscreenCanvas ? c.getContext("2d") : null;
    if (n) {
      let c = u();
      c.width = e.width, c.height = e.height;
      let l = f(c);
      if (l != null) {
        let d = e.height, p = e.width;
        if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (d = t.resizedHeight, p = t.resizedWidth), t !== void 0) {
          if (s = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
          s.tensorFormat = "RGBA", s.height = d, s.width = p;
        } else s.tensorFormat = "RGBA", s.height = d, s.width = p;
        l.drawImage(e, 0, 0), a = l.getImageData(0, 0, p, d).data;
      } else throw new Error("Can not access image data");
    } else if (o) {
      let c, l;
      if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (c = t.resizedHeight, l = t.resizedWidth) : (c = e.height, l = e.width), t !== void 0 && (s = t), s.format = "RGBA", s.height = c, s.width = l, t !== void 0) {
        let d = u();
        d.width = l, d.height = c;
        let p = f(d);
        if (p != null) p.putImageData(e, 0, 0), a = p.getImageData(0, 0, l, c).data;
        else throw new Error("Can not access image data");
      } else a = e.data;
    } else if (r) {
      if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
      let c = u();
      c.width = e.width, c.height = e.height;
      let l = f(c);
      if (l != null) {
        let d = e.height, p = e.width;
        return l.drawImage(e, 0, 0, p, d), a = l.getImageData(0, 0, p, d).data, s.height = d, s.width = p, Je(a, s);
      } else throw new Error("Can not access image data");
    } else {
      if (i) return new Promise((c, l) => {
        let d = u(), p = f(d);
        if (!e || !p) return l();
        let w = new Image();
        w.crossOrigin = "Anonymous", w.src = e, w.onload = () => {
          d.width = w.width, d.height = w.height, p.drawImage(w, 0, 0, d.width, d.height);
          let b = p.getImageData(0, 0, d.width, d.height);
          s.height = d.height, s.width = d.width, c(Je(b.data, s));
        };
      });
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }
    if (a !== void 0) return Je(a, s);
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }, At = (e, t) => {
    let { width: n, height: o, download: r, dispose: i } = t, a = [1, o, n, 4];
    return new U({ location: "texture", type: "float32", texture: e, dims: a, download: r, dispose: i });
  }, Ot = (e, t) => {
    let { dataType: n, dims: o, download: r, dispose: i } = t;
    return new U({ location: "gpu-buffer", type: n ?? "float32", gpuBuffer: e, dims: o, download: r, dispose: i });
  }, It = (e, t) => {
    let { dataType: n, dims: o, download: r, dispose: i } = t;
    return new U({ location: "ml-tensor", type: n ?? "float32", mlTensor: e, dims: o, download: r, dispose: i });
  }, Pt = (e, t, n) => new U({ location: "cpu-pinned", type: e, data: t, dims: n ?? [t.length] });
});
var q;
var de;
var Lt;
var vt;
var Bt = E(() => {
  "use strict";
  q = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), de = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), Lt = false, vt = () => {
    if (!Lt) {
      Lt = true;
      let e = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, n = globalThis.Float16Array, o = typeof n < "u" && n.from;
      e && (q.set("int64", BigInt64Array), de.set(BigInt64Array, "int64")), t && (q.set("uint64", BigUint64Array), de.set(BigUint64Array, "uint64")), o ? (q.set("float16", n), de.set(n, "float16")) : q.set("float16", Uint16Array);
    }
  };
});
var Ut;
var _t;
var Mt = E(() => {
  "use strict";
  ge();
  Ut = (e) => {
    let t = 1;
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (typeof o != "number" || !Number.isSafeInteger(o)) throw new TypeError(`dims[${n}] must be an integer, got: ${o}`);
      if (o < 0) throw new RangeError(`dims[${n}] must be a non-negative integer, got: ${o}`);
      t *= o;
    }
    return t;
  }, _t = (e, t) => {
    switch (e.location) {
      case "cpu":
        return new U(e.type, e.data, t);
      case "cpu-pinned":
        return new U({ location: "cpu-pinned", data: e.data, type: e.type, dims: t });
      case "texture":
        return new U({ location: "texture", texture: e.texture, type: e.type, dims: t });
      case "gpu-buffer":
        return new U({ location: "gpu-buffer", gpuBuffer: e.gpuBuffer, type: e.type, dims: t });
      case "ml-tensor":
        return new U({ location: "ml-tensor", mlTensor: e.mlTensor, type: e.type, dims: t });
      default:
        throw new Error(`tensorReshape: tensor location ${e.location} is not supported`);
    }
  };
});
var U;
var ge = E(() => {
  "use strict";
  Tt();
  xt();
  Bt();
  Mt();
  U = class {
    constructor(t, n, o) {
      vt();
      let r, i;
      if (typeof t == "object" && "location" in t) switch (this.dataLocation = t.location, r = t.type, i = t.dims, t.location) {
        case "cpu-pinned": {
          let s = q.get(r);
          if (!s) throw new TypeError(`unsupported type "${r}" to create tensor from pinned buffer`);
          if (!(t.data instanceof s)) throw new TypeError(`buffer should be of type ${s.name}`);
          this.cpuData = t.data;
          break;
        }
        case "texture": {
          if (r !== "float32") throw new TypeError(`unsupported type "${r}" to create tensor from texture`);
          this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "gpu-buffer": {
          if (r !== "float32" && r !== "float16" && r !== "int32" && r !== "int64" && r !== "uint32" && r !== "uint8" && r !== "bool" && r !== "uint4" && r !== "int4") throw new TypeError(`unsupported type "${r}" to create tensor from gpu buffer`);
          this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "ml-tensor": {
          if (r !== "float32" && r !== "float16" && r !== "int32" && r !== "int64" && r !== "uint32" && r !== "uint64" && r !== "int8" && r !== "uint8" && r !== "bool" && r !== "uint4" && r !== "int4") throw new TypeError(`unsupported type "${r}" to create tensor from MLTensor`);
          this.mlTensorData = t.mlTensor, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
      else {
        let s, u;
        if (typeof t == "string") if (r = t, u = o, t === "string") {
          if (!Array.isArray(n)) throw new TypeError("A string tensor's data must be a string array.");
          s = n;
        } else {
          let f = q.get(t);
          if (f === void 0) throw new TypeError(`Unsupported tensor type: ${t}.`);
          if (Array.isArray(n)) {
            if (t === "float16" && f === Uint16Array || t === "uint4" || t === "int4") throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${f.name} as data.`);
            t === "uint64" || t === "int64" ? s = f.from(n, BigInt) : s = f.from(n);
          } else if (n instanceof f) s = n;
          else if (n instanceof Uint8ClampedArray) if (t === "uint8") s = Uint8Array.from(n);
          else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (t === "float16" && n instanceof Uint16Array && f !== Uint16Array) s = new globalThis.Float16Array(n.buffer, n.byteOffset, n.length);
          else throw new TypeError(`A ${r} tensor's data must be type of ${f}`);
        }
        else if (u = n, Array.isArray(t)) {
          if (t.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
          let f = typeof t[0];
          if (f === "string") r = "string", s = t;
          else if (f === "boolean") r = "bool", s = Uint8Array.from(t);
          else throw new TypeError(`Invalid element type of data array: ${f}.`);
        } else if (t instanceof Uint8ClampedArray) r = "uint8", s = Uint8Array.from(t);
        else {
          let f = de.get(t.constructor);
          if (f === void 0) throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
          r = f, s = t;
        }
        if (u === void 0) u = [s.length];
        else if (!Array.isArray(u)) throw new TypeError("A tensor's dims must be a number array");
        i = u, this.cpuData = s, this.dataLocation = "cpu";
      }
      let a = Ut(i);
      if (this.cpuData && a !== this.cpuData.length && !((r === "uint4" || r === "int4") && Math.ceil(a / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${a}) does not match data length(${this.cpuData.length}).`);
      this.type = r, this.dims = i, this.size = a;
    }
    static async fromImage(t, n) {
      return St(t, n);
    }
    static fromTexture(t, n) {
      return At(t, n);
    }
    static fromGpuBuffer(t, n) {
      return Ot(t, n);
    }
    static fromMLTensor(t, n) {
      return It(t, n);
    }
    static fromPinnedBuffer(t, n, o) {
      return Pt(t, n, o);
    }
    toDataURL(t) {
      return gt(this, t);
    }
    toImageData(t) {
      return Et(this, t);
    }
    get data() {
      if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
      return this.cpuData;
    }
    get location() {
      return this.dataLocation;
    }
    get texture() {
      if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
      return this.gpuTextureData;
    }
    get gpuBuffer() {
      if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
      return this.gpuBufferData;
    }
    get mlTensor() {
      if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
      return this.mlTensorData;
    }
    async getData(t) {
      switch (this.ensureValid(), this.dataLocation) {
        case "cpu":
        case "cpu-pinned":
          return this.data;
        case "texture":
        case "gpu-buffer":
        case "ml-tensor": {
          if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          try {
            this.isDownloading = true;
            let n = await this.downloader();
            return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = n, t && this.disposer && (this.disposer(), this.disposer = void 0), n;
          } finally {
            this.isDownloading = false;
          }
        }
        default:
          throw new Error(`cannot get data from location: ${this.dataLocation}`);
      }
    }
    dispose() {
      if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
      this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
    }
    ensureValid() {
      if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
    }
    reshape(t) {
      if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
      return _t(this, t);
    }
  };
});
var W;
var Ze = E(() => {
  "use strict";
  ge();
  W = U;
});
var Dt;
var Ct;
var J;
var Z;
var Xe = E(() => {
  "use strict";
  qe();
  Dt = (e, t) => {
    (typeof C.trace > "u" ? !C.wasm.trace : !C.trace) || console.timeStamp(`${e}::ORT::${t}`);
  }, Ct = (e, t) => {
    let n = new Error().stack?.split(/\r\n|\r|\n/g) || [], o = false;
    for (let r = 0; r < n.length; r++) {
      if (o && !n[r].includes("TRACE_FUNC")) {
        let i = `FUNC_${e}::${n[r].trim().split(" ")[1]}`;
        t && (i += `::${t}`), Dt("CPU", i);
        return;
      }
      n[r].includes("TRACE_FUNC") && (o = true);
    }
  }, J = (e) => {
    (typeof C.trace > "u" ? !C.wasm.trace : !C.trace) || Ct("BEGIN", e);
  }, Z = (e) => {
    (typeof C.trace > "u" ? !C.wasm.trace : !C.trace) || Ct("END", e);
  };
});
var Ee;
var Rt = E(() => {
  "use strict";
  Ye();
  Ze();
  Xe();
  Ee = class e {
    constructor(t) {
      this.handler = t;
    }
    async run(t, n, o) {
      J();
      let r = {}, i = {};
      if (typeof t != "object" || t === null || t instanceof W || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
      let a = true;
      if (typeof n == "object") {
        if (n === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
        if (n instanceof W) throw new TypeError("'fetches' cannot be a Tensor");
        if (Array.isArray(n)) {
          if (n.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
          a = false;
          for (let f of n) {
            if (typeof f != "string") throw new TypeError("'fetches' must be a string array or an object.");
            if (this.outputNames.indexOf(f) === -1) throw new RangeError(`'fetches' contains invalid output name: ${f}.`);
            r[f] = null;
          }
          if (typeof o == "object" && o !== null) i = o;
          else if (typeof o < "u") throw new TypeError("'options' must be an object.");
        } else {
          let f = false, c = Object.getOwnPropertyNames(n);
          for (let l of this.outputNames) if (c.indexOf(l) !== -1) {
            let d = n[l];
            (d === null || d instanceof W) && (f = true, a = false, r[l] = d);
          }
          if (f) {
            if (typeof o == "object" && o !== null) i = o;
            else if (typeof o < "u") throw new TypeError("'options' must be an object.");
          } else i = n;
        }
      } else if (typeof n < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
      for (let f of this.inputNames) if (typeof t[f] > "u") throw new Error(`input '${f}' is missing in 'feeds'.`);
      if (a) for (let f of this.outputNames) r[f] = null;
      let s = await this.handler.run(t, r, i), u = {};
      for (let f in s) if (Object.hasOwnProperty.call(s, f)) {
        let c = s[f];
        c instanceof W ? u[f] = c : u[f] = new W(c.type, c.data, c.dims);
      }
      return Z(), u;
    }
    async release() {
      return this.handler.dispose();
    }
    static async create(t, n, o, r) {
      J();
      let i, a = {};
      if (typeof t == "string") {
        if (i = t, typeof n == "object" && n !== null) a = n;
        else if (typeof n < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof Uint8Array) {
        if (i = t, typeof n == "object" && n !== null) a = n;
        else if (typeof n < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
        let c = t, l = 0, d = t.byteLength;
        if (typeof n == "object" && n !== null) a = n;
        else if (typeof n == "number") {
          if (l = n, !Number.isSafeInteger(l)) throw new RangeError("'byteOffset' must be an integer.");
          if (l < 0 || l >= c.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${c.byteLength}).`);
          if (d = t.byteLength - l, typeof o == "number") {
            if (d = o, !Number.isSafeInteger(d)) throw new RangeError("'byteLength' must be an integer.");
            if (d <= 0 || l + d > c.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${c.byteLength - l}].`);
            if (typeof r == "object" && r !== null) a = r;
            else if (typeof r < "u") throw new TypeError("'options' must be an object.");
          } else if (typeof o < "u") throw new TypeError("'byteLength' must be a number.");
        } else if (typeof n < "u") throw new TypeError("'options' must be an object.");
        i = new Uint8Array(c, l, d);
      } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let [s, u] = await pt(a), f = await s.createInferenceSessionHandler(i, u);
      return Z(), new e(f);
    }
    startProfiling() {
      this.handler.startProfiling();
    }
    endProfiling() {
      this.handler.endProfiling();
    }
    get inputNames() {
      return this.handler.inputNames;
    }
    get outputNames() {
      return this.handler.outputNames;
    }
    get inputMetadata() {
      return this.handler.inputMetadata;
    }
    get outputMetadata() {
      return this.handler.outputMetadata;
    }
  };
});
var Ln;
var Ft = E(() => {
  "use strict";
  Rt();
  Ln = Ee;
});
var kt = E(() => {
  "use strict";
});
var Nt = E(() => {
  "use strict";
});
var Wt = E(() => {
  "use strict";
});
var Gt = E(() => {
  "use strict";
});
var Ke = {};
Ve(Ke, { InferenceSession: () => Ln, TRACE: () => Dt, TRACE_FUNC_BEGIN: () => J, TRACE_FUNC_END: () => Z, Tensor: () => W, env: () => I, registerBackend: () => ce });
var X = E(() => {
  "use strict";
  mt();
  bt();
  Ft();
  Ze();
  kt();
  Nt();
  Xe();
  Wt();
  Gt();
});
var Te = E(() => {
  "use strict";
});
var jt = {};
Ve(jt, { default: () => vn });
var zt;
var Ht;
var vn;
var Vt = E(() => {
  "use strict";
  Qe();
  K();
  Se();
  zt = "ort-wasm-proxy-worker", Ht = globalThis.self?.name === zt;
  Ht && (self.onmessage = (e) => {
    let { type: t, in: n } = e.data;
    try {
      switch (t) {
        case "init-wasm":
          Ae(n.wasm).then(() => {
            Oe(n).then(() => {
              postMessage({ type: t });
            }, (o) => {
              postMessage({ type: t, err: o });
            });
          }, (o) => {
            postMessage({ type: t, err: o });
          });
          break;
        case "init-ep": {
          let { epName: o, env: r } = n;
          Ie(r, o).then(() => {
            postMessage({ type: t });
          }, (i) => {
            postMessage({ type: t, err: i });
          });
          break;
        }
        case "copy-from": {
          let { buffer: o } = n, r = le(o);
          postMessage({ type: t, out: r });
          break;
        }
        case "create": {
          let { model: o, options: r } = n;
          Pe(o, r).then((i) => {
            postMessage({ type: t, out: i });
          }, (i) => {
            postMessage({ type: t, err: i });
          });
          break;
        }
        case "release":
          xe(n), postMessage({ type: t });
          break;
        case "run": {
          let { sessionId: o, inputIndices: r, inputs: i, outputIndices: a, options: s } = n;
          Le(o, r, i, a, new Array(a.length).fill(null), s).then((u) => {
            u.some((f) => f[3] !== "cpu") ? postMessage({ type: t, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: t, out: u }, Be([...i, ...u]));
          }, (u) => {
            postMessage({ type: t, err: u });
          });
          break;
        }
        case "end-profiling":
          ve(n), postMessage({ type: t });
          break;
        default:
      }
    } catch (o) {
      postMessage({ type: t, err: o });
    }
  });
  vn = Ht ? null : (e) => new Worker(e ?? R, { type: "module", name: zt });
});
var Jt;
var Bn;
var Un;
var R;
var Ue;
var et;
var _n;
var Mn;
var Zt;
var Dn;
var Yt;
var Xt;
var qt;
var Kt;
var Se = E(() => {
  "use strict";
  Te();
  Jt = typeof location > "u" ? void 0 : location.origin, Bn = import.meta.url > "file:" && import.meta.url < "file;", Un = () => {
    if (true) {
      if (Bn) {
        let e = URL;
        return new URL(new e("ort.wasm.bundle.min.mjs", import.meta.url).href, Jt).href;
      }
      return import.meta.url;
    }
  }, R = Un(), Ue = () => {
    if (R && !R.startsWith("blob:")) return R.substring(0, R.lastIndexOf("/") + 1);
  }, et = (e, t) => {
    try {
      let n = t ?? R;
      return (n ? new URL(e, n) : new URL(e)).origin === Jt;
    } catch {
      return false;
    }
  }, _n = (e, t) => {
    let n = t ?? R;
    try {
      return (n ? new URL(e, n) : new URL(e)).href;
    } catch {
      return;
    }
  }, Mn = (e, t) => `${t ?? "./"}${e}`, Zt = async (e) => {
    let n = await (await fetch(e, { credentials: "same-origin" })).blob();
    return URL.createObjectURL(n);
  }, Dn = async (e) => (await import(
    /*webpackIgnore:true*/
    e
  )).default, Yt = (Vt(), lt(jt)).default, Xt = async () => {
    if (!R) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
    if (et(R)) return [void 0, Yt()];
    let e = await Zt(R);
    return [e, Yt(e)];
  }, qt = void 0, Kt = async (e, t, n) => {
    if (!e && !t && qt && R && et(R)) return [void 0, qt];
    {
      let o = "ort-wasm-simd-threaded.mjs", r = e ?? _n(o, t), i = n && r && !et(r, t), a = i ? await Zt(r) : r ?? Mn(o, t);
      return [i ? a : void 0, await Dn(a)];
    }
  };
});
var tt;
var nt;
var _e;
var Qt;
var Cn;
var Rn;
var Fn;
var Ae;
var A;
var K = E(() => {
  "use strict";
  Se();
  nt = false, _e = false, Qt = false, Cn = () => {
    if (typeof SharedArrayBuffer > "u") return false;
    try {
      return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
    } catch {
      return false;
    }
  }, Rn = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
    } catch {
      return false;
    }
  }, Fn = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
    } catch {
      return false;
    }
  }, Ae = async (e) => {
    if (nt) return Promise.resolve();
    if (_e) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
    if (Qt) throw new Error("previous call to 'initializeWebAssembly()' failed.");
    _e = true;
    let t = e.initTimeout, n = e.numThreads;
    if (e.simd !== false) {
      if (e.simd === "relaxed") {
        if (!Fn()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
      } else if (!Rn()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
    }
    let o = Cn();
    n > 1 && !o && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + n + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), e.numThreads = n = 1);
    let r = e.wasmPaths, i = typeof r == "string" ? r : void 0, a = r?.mjs, s = a?.href ?? a, u = r?.wasm, f = u?.href ?? u, c = e.wasmBinary, [l, d] = await Kt(s, i, n > 1), p = false, w = [];
    if (t > 0 && w.push(new Promise((b) => {
      setTimeout(() => {
        p = true, b();
      }, t);
    })), w.push(new Promise((b, O) => {
      let m = { numThreads: n };
      if (c) m.wasmBinary = c;
      else if (f || i) m.locateFile = (h) => f ?? i + h;
      else if (s && s.indexOf("blob:") !== 0) m.locateFile = (h) => new URL(h, s).href;
      else if (l) {
        let h = Ue();
        h && (m.locateFile = (P) => h + P);
      }
      d(m).then((h) => {
        _e = false, nt = true, tt = h, b(), l && URL.revokeObjectURL(l);
      }, (h) => {
        _e = false, Qt = true, O(h);
      });
    })), await Promise.race(w), p) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
  }, A = () => {
    if (nt && tt) return tt;
    throw new Error("WebAssembly is not initialized yet.");
  };
});
var F;
var pe;
var T;
var Me = E(() => {
  "use strict";
  K();
  F = (e, t) => {
    let n = A(), o = n.lengthBytesUTF8(e) + 1, r = n._malloc(o);
    return n.stringToUTF8(e, r, o), t.push(r), r;
  }, pe = (e, t, n, o) => {
    if (typeof e == "object" && e !== null) {
      if (n.has(e)) throw new Error("Circular reference in options");
      n.add(e);
    }
    Object.entries(e).forEach(([r, i]) => {
      let a = t ? t + r : r;
      if (typeof i == "object") pe(i, a + ".", n, o);
      else if (typeof i == "string" || typeof i == "number") o(a, i.toString());
      else if (typeof i == "boolean") o(a, i ? "1" : "0");
      else throw new Error(`Can't handle extra config type: ${typeof i}`);
    });
  }, T = (e) => {
    let t = A(), n = t.stackSave();
    try {
      let o = t.PTR_SIZE, r = t.stackAlloc(2 * o);
      t._OrtGetLastError(r, r + o);
      let i = Number(t.getValue(r, o === 4 ? "i32" : "i64")), a = t.getValue(r + o, "*"), s = a ? t.UTF8ToString(a) : "";
      throw new Error(`${e} ERROR_CODE: ${i}, ERROR_MESSAGE: ${s}`);
    } finally {
      t.stackRestore(n);
    }
  };
});
var en;
var tn = E(() => {
  "use strict";
  K();
  Me();
  en = (e) => {
    let t = A(), n = 0, o = [], r = e || {};
    try {
      if (e?.logSeverityLevel === void 0) r.logSeverityLevel = 2;
      else if (typeof e.logSeverityLevel != "number" || !Number.isInteger(e.logSeverityLevel) || e.logSeverityLevel < 0 || e.logSeverityLevel > 4) throw new Error(`log serverity level is not valid: ${e.logSeverityLevel}`);
      if (e?.logVerbosityLevel === void 0) r.logVerbosityLevel = 0;
      else if (typeof e.logVerbosityLevel != "number" || !Number.isInteger(e.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);
      e?.terminate === void 0 && (r.terminate = false);
      let i = 0;
      return e?.tag !== void 0 && (i = F(e.tag, o)), n = t._OrtCreateRunOptions(r.logSeverityLevel, r.logVerbosityLevel, !!r.terminate, i), n === 0 && T("Can't create run options."), e?.extra !== void 0 && pe(e.extra, "", /* @__PURE__ */ new WeakSet(), (a, s) => {
        let u = F(a, o), f = F(s, o);
        t._OrtAddRunConfigEntry(n, u, f) !== 0 && T(`Can't set a run config entry: ${a} - ${s}.`);
      }), [n, o];
    } catch (i) {
      throw n !== 0 && t._OrtReleaseRunOptions(n), o.forEach((a) => t._free(a)), i;
    }
  };
});
var kn;
var Nn;
var Wn;
var De;
var Gn;
var nn;
var rn = E(() => {
  "use strict";
  K();
  Me();
  kn = (e) => {
    switch (e) {
      case "disabled":
        return 0;
      case "basic":
        return 1;
      case "extended":
        return 2;
      case "all":
        return 99;
      default:
        throw new Error(`unsupported graph optimization level: ${e}`);
    }
  }, Nn = (e) => {
    switch (e) {
      case "sequential":
        return 0;
      case "parallel":
        return 1;
      default:
        throw new Error(`unsupported execution mode: ${e}`);
    }
  }, Wn = (e) => {
    e.extra || (e.extra = {}), e.extra.session || (e.extra.session = {});
    let t = e.extra.session;
    t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), e.executionProviders && e.executionProviders.some((n) => (typeof n == "string" ? n : n.name) === "webgpu") && (e.enableMemPattern = false);
  }, De = (e, t, n, o) => {
    let r = F(t, o), i = F(n, o);
    A()._OrtAddSessionConfigEntry(e, r, i) !== 0 && T(`Can't set a session config entry: ${t} - ${n}.`);
  }, Gn = async (e, t, n) => {
    for (let o of t) {
      let r = typeof o == "string" ? o : o.name, i = [];
      switch (r) {
        case "webnn":
          if (r = "WEBNN", typeof o != "string") {
            let l = o?.deviceType;
            l && De(e, "deviceType", l, n);
          }
          break;
        case "webgpu":
          if (r = "JS", typeof o != "string") {
            let c = o;
            if (c?.preferredLayout) {
              if (c.preferredLayout !== "NCHW" && c.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${c.preferredLayout}`);
              De(e, "preferredLayout", c.preferredLayout, n);
            }
          }
          break;
        case "wasm":
        case "cpu":
          continue;
        default:
          throw new Error(`not supported execution provider: ${r}`);
      }
      let a = F(r, n), s = i.length, u = 0, f = 0;
      if (s > 0) {
        u = A()._malloc(s * A().PTR_SIZE), n.push(u), f = A()._malloc(s * A().PTR_SIZE), n.push(f);
        for (let c = 0; c < s; c++) A().setValue(u + c * A().PTR_SIZE, i[c][0], "*"), A().setValue(f + c * A().PTR_SIZE, i[c][1], "*");
      }
      await A()._OrtAppendExecutionProvider(e, a, u, f, s) !== 0 && T(`Can't append execution provider: ${r}.`);
    }
  }, nn = async (e) => {
    let t = A(), n = 0, o = [], r = e || {};
    Wn(r);
    try {
      let i = kn(r.graphOptimizationLevel ?? "all"), a = Nn(r.executionMode ?? "sequential"), s = typeof r.logId == "string" ? F(r.logId, o) : 0, u = r.logSeverityLevel ?? 2;
      if (!Number.isInteger(u) || u < 0 || u > 4) throw new Error(`log serverity level is not valid: ${u}`);
      let f = r.logVerbosityLevel ?? 0;
      if (!Number.isInteger(f) || f < 0 || f > 4) throw new Error(`log verbosity level is not valid: ${f}`);
      let c = typeof r.optimizedModelFilePath == "string" ? F(r.optimizedModelFilePath, o) : 0;
      if (n = t._OrtCreateSessionOptions(i, !!r.enableCpuMemArena, !!r.enableMemPattern, a, !!r.enableProfiling, 0, s, u, f, c), n === 0 && T("Can't create session options."), r.executionProviders && await Gn(n, r.executionProviders, o), r.enableGraphCapture !== void 0) {
        if (typeof r.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${r.enableGraphCapture}`);
        De(n, "enableGraphCapture", r.enableGraphCapture.toString(), o);
      }
      if (r.freeDimensionOverrides) for (let [l, d] of Object.entries(r.freeDimensionOverrides)) {
        if (typeof l != "string") throw new Error(`free dimension override name must be a string: ${l}`);
        if (typeof d != "number" || !Number.isInteger(d) || d < 0) throw new Error(`free dimension override value must be a non-negative integer: ${d}`);
        let p = F(l, o);
        t._OrtAddFreeDimensionOverride(n, p, d) !== 0 && T(`Can't set a free dimension override: ${l} - ${d}.`);
      }
      return r.extra !== void 0 && pe(r.extra, "", /* @__PURE__ */ new WeakSet(), (l, d) => {
        De(n, l, d, o);
      }), [n, o];
    } catch (i) {
      throw n !== 0 && t._OrtReleaseSessionOptions(n) !== 0 && T("Can't release session options."), o.forEach((a) => t._free(a)), i;
    }
  };
});
var re;
var Ce;
var oe;
var on;
var sn;
var Re;
var Fe;
var an;
var rt = E(() => {
  "use strict";
  re = (e) => {
    switch (e) {
      case "int8":
        return 3;
      case "uint8":
        return 2;
      case "bool":
        return 9;
      case "int16":
        return 5;
      case "uint16":
        return 4;
      case "int32":
        return 6;
      case "uint32":
        return 12;
      case "float16":
        return 10;
      case "float32":
        return 1;
      case "float64":
        return 11;
      case "string":
        return 8;
      case "int64":
        return 7;
      case "uint64":
        return 13;
      case "int4":
        return 22;
      case "uint4":
        return 21;
      default:
        throw new Error(`unsupported data type: ${e}`);
    }
  }, Ce = (e) => {
    switch (e) {
      case 3:
        return "int8";
      case 2:
        return "uint8";
      case 9:
        return "bool";
      case 5:
        return "int16";
      case 4:
        return "uint16";
      case 6:
        return "int32";
      case 12:
        return "uint32";
      case 10:
        return "float16";
      case 1:
        return "float32";
      case 11:
        return "float64";
      case 8:
        return "string";
      case 7:
        return "int64";
      case 13:
        return "uint64";
      case 22:
        return "int4";
      case 21:
        return "uint4";
      default:
        throw new Error(`unsupported data type: ${e}`);
    }
  }, oe = (e, t) => {
    let n = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][e], o = typeof t == "number" ? t : t.reduce((r, i) => r * i, 1);
    return n > 0 ? Math.ceil(o * n) : void 0;
  }, on = (e) => {
    switch (e) {
      case "float16":
        return typeof Float16Array < "u" && Float16Array.from ? Float16Array : Uint16Array;
      case "float32":
        return Float32Array;
      case "uint8":
        return Uint8Array;
      case "int8":
        return Int8Array;
      case "uint16":
        return Uint16Array;
      case "int16":
        return Int16Array;
      case "int32":
        return Int32Array;
      case "bool":
        return Uint8Array;
      case "float64":
        return Float64Array;
      case "uint32":
        return Uint32Array;
      case "int64":
        return BigInt64Array;
      case "uint64":
        return BigUint64Array;
      default:
        throw new Error(`unsupported type: ${e}`);
    }
  }, sn = (e) => {
    switch (e) {
      case "verbose":
        return 0;
      case "info":
        return 1;
      case "warning":
        return 2;
      case "error":
        return 3;
      case "fatal":
        return 4;
      default:
        throw new Error(`unsupported logging level: ${e}`);
    }
  }, Re = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", Fe = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint64" || e === "int8" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", an = (e) => {
    switch (e) {
      case "none":
        return 0;
      case "cpu":
        return 1;
      case "cpu-pinned":
        return 2;
      case "texture":
        return 3;
      case "gpu-buffer":
        return 4;
      case "ml-tensor":
        return 5;
      default:
        throw new Error(`unsupported data location: ${e}`);
    }
  };
});
var me;
var ot = E(() => {
  "use strict";
  Te();
  me = async (e) => {
    if (typeof e == "string") if (false) try {
      let { readFile: t } = je("node:fs/promises");
      return new Uint8Array(await t(e));
    } catch (t) {
      if (t.code === "ERR_FS_FILE_TOO_LARGE") {
        let { createReadStream: n } = je("node:fs"), o = n(e), r = [];
        for await (let i of o) r.push(i);
        return new Uint8Array(Buffer.concat(r));
      }
      throw t;
    }
    else {
      let t = await fetch(e);
      if (!t.ok) throw new Error(`failed to load external data file: ${e}`);
      let n = t.headers.get("Content-Length"), o = n ? parseInt(n, 10) : 0;
      if (o < 1073741824) return new Uint8Array(await t.arrayBuffer());
      {
        if (!t.body) throw new Error(`failed to load external data file: ${e}, no response body.`);
        let r = t.body.getReader(), i;
        try {
          i = new ArrayBuffer(o);
        } catch (s) {
          if (s instanceof RangeError) {
            let u = Math.ceil(o / 65536);
            i = new WebAssembly.Memory({ initial: u, maximum: u }).buffer;
          } else throw s;
        }
        let a = 0;
        for (; ; ) {
          let { done: s, value: u } = await r.read();
          if (s) break;
          let f = u.byteLength;
          new Uint8Array(i, a, f).set(u), a += f;
        }
        return new Uint8Array(i, 0, o);
      }
    }
    else return e instanceof Blob ? new Uint8Array(await e.arrayBuffer()) : e instanceof Uint8Array ? e : new Uint8Array(e);
  };
});
var $n;
var Oe;
var Ie;
var se;
var zn;
var un;
var le;
var Pe;
var xe;
var fn;
var Le;
var ve;
var Be;
var Qe = E(() => {
  "use strict";
  tn();
  rn();
  rt();
  K();
  Me();
  ot();
  $n = (e, t) => {
    A()._OrtInit(e, t) !== 0 && T("Can't initialize onnxruntime.");
  }, Oe = async (e) => {
    $n(e.wasm.numThreads, sn(e.logLevel));
  }, Ie = async (e, t) => {
    A().asyncInit?.();
  }, se = /* @__PURE__ */ new Map(), zn = (e) => {
    let t = A(), n = t.stackSave();
    try {
      let o = t.PTR_SIZE, r = t.stackAlloc(2 * o);
      t._OrtGetInputOutputCount(e, r, r + o) !== 0 && T("Can't get session input/output count.");
      let a = o === 4 ? "i32" : "i64";
      return [Number(t.getValue(r, a)), Number(t.getValue(r + o, a))];
    } finally {
      t.stackRestore(n);
    }
  }, un = (e, t) => {
    let n = A(), o = n.stackSave(), r = 0;
    try {
      let i = n.PTR_SIZE, a = n.stackAlloc(2 * i);
      n._OrtGetInputOutputMetadata(e, t, a, a + i) !== 0 && T("Can't get session input/output metadata.");
      let u = Number(n.getValue(a, "*"));
      r = Number(n.getValue(a + i, "*"));
      let f = n.HEAP32[r / 4];
      if (f === 0) return [u, 0];
      let c = n.HEAPU32[r / 4 + 1], l = [];
      for (let d = 0; d < c; d++) {
        let p = Number(n.getValue(r + 8 + d * i, "*"));
        l.push(p !== 0 ? n.UTF8ToString(p) : Number(n.getValue(r + 8 + (d + c) * i, "*")));
      }
      return [u, f, l];
    } finally {
      n.stackRestore(o), r !== 0 && n._OrtFree(r);
    }
  }, le = (e) => {
    let t = A(), n = t._malloc(e.byteLength);
    if (n === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);
    return t.HEAPU8.set(e, n), [n, e.byteLength];
  }, Pe = async (e, t) => {
    let n, o, r = A();
    Array.isArray(e) ? [n, o] = e : e.buffer === r.HEAPU8.buffer ? [n, o] = [e.byteOffset, e.byteLength] : [n, o] = le(e);
    let i = 0, a = 0, s = 0, u = [], f = [], c = [];
    try {
      if ([a, u] = await nn(t), t?.externalData && r.mountExternalData) {
        let g = [];
        for (let S of t.externalData) {
          let B = typeof S == "string" ? S : S.path;
          g.push(me(typeof S == "string" ? S : S.data).then((D) => {
            r.mountExternalData(B, D);
          }));
        }
        await Promise.all(g);
      }
      for (let g of t?.executionProviders ?? []) if ((typeof g == "string" ? g : g.name) === "webnn") {
        if (r.shouldTransferToMLTensor = false, typeof g != "string") {
          let B = g, D = B?.context, _ = B?.gpuDevice, te = B?.deviceType, ue = B?.powerPreference;
          D ? r.currentContext = D : _ ? r.currentContext = await r.webnnCreateMLContext(_) : r.currentContext = await r.webnnCreateMLContext({ deviceType: te, powerPreference: ue });
        } else r.currentContext = await r.webnnCreateMLContext();
        break;
      }
      i = await r._OrtCreateSession(n, o, a), r.webgpuOnCreateSession?.(i), i === 0 && T("Can't create a session."), r.jsepOnCreateSession?.(), r.currentContext && (r.webnnRegisterMLContext(i, r.currentContext), r.currentContext = void 0, r.shouldTransferToMLTensor = true);
      let [l, d] = zn(i), p = !!t?.enableGraphCapture, w = [], b = [], O = [], m = [], h = [];
      for (let g = 0; g < l; g++) {
        let [S, B, D] = un(i, g);
        S === 0 && T("Can't get an input name."), f.push(S);
        let _ = r.UTF8ToString(S);
        w.push(_), O.push(B === 0 ? { name: _, isTensor: false } : { name: _, isTensor: true, type: Ce(B), shape: D });
      }
      for (let g = 0; g < d; g++) {
        let [S, B, D] = un(i, g + l);
        S === 0 && T("Can't get an output name."), c.push(S);
        let _ = r.UTF8ToString(S);
        b.push(_), m.push(B === 0 ? { name: _, isTensor: false } : { name: _, isTensor: true, type: Ce(B), shape: D });
      }
      return se.set(i, [i, f, c, null, p, false]), [i, w, b, O, m];
    } catch (l) {
      throw f.forEach((d) => r._OrtFree(d)), c.forEach((d) => r._OrtFree(d)), s !== 0 && r._OrtReleaseBinding(s) !== 0 && T("Can't release IO binding."), i !== 0 && r._OrtReleaseSession(i) !== 0 && T("Can't release session."), l;
    } finally {
      r._free(n), a !== 0 && r._OrtReleaseSessionOptions(a) !== 0 && T("Can't release session options."), u.forEach((l) => r._free(l)), r.unmountExternalData?.();
    }
  }, xe = (e) => {
    let t = A(), n = se.get(e);
    if (!n) throw new Error(`cannot release session. invalid session id: ${e}`);
    let [o, r, i, a, s] = n;
    a && (s && t._OrtClearBoundOutputs(a.handle) !== 0 && T("Can't clear bound outputs."), t._OrtReleaseBinding(a.handle) !== 0 && T("Can't release IO binding.")), t.jsepOnReleaseSession?.(e), t.webnnOnReleaseSession?.(e), t.webgpuOnReleaseSession?.(e), r.forEach((u) => t._OrtFree(u)), i.forEach((u) => t._OrtFree(u)), t._OrtReleaseSession(o) !== 0 && T("Can't release session."), se.delete(e);
  }, fn = async (e, t, n, o, r, i, a = false) => {
    if (!e) {
      t.push(0);
      return;
    }
    let s = A(), u = s.PTR_SIZE, f = e[0], c = e[1], l = e[3], d = l, p, w;
    if (f === "string" && (l === "gpu-buffer" || l === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
    if (a && l !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${i} when enableGraphCapture is true.`);
    if (l === "gpu-buffer") {
      let m = e[2].gpuBuffer;
      w = oe(re(f), c);
      {
        let h = s.jsepRegisterBuffer;
        if (!h) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        p = h(o, i, m, w);
      }
    } else if (l === "ml-tensor") {
      let m = e[2].mlTensor;
      w = oe(re(f), c);
      let h = s.webnnRegisterMLTensor;
      if (!h) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
      p = h(o, m, re(f), c);
    } else {
      let m = e[2];
      if (Array.isArray(m)) {
        w = u * m.length, p = s._malloc(w), n.push(p);
        for (let h = 0; h < m.length; h++) {
          if (typeof m[h] != "string") throw new TypeError(`tensor data at index ${h} is not a string`);
          s.setValue(p + h * u, F(m[h], n), "*");
        }
      } else {
        let h = s.webnnIsGraphInput, P = s.webnnIsGraphOutput;
        if (f !== "string" && h && P) {
          let g = s.UTF8ToString(r);
          if (h(o, g) || P(o, g)) {
            let S = re(f);
            w = oe(S, c), d = "ml-tensor";
            let B = s.webnnCreateTemporaryTensor, D = s.webnnUploadTensor;
            if (!B || !D) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
            let _ = await B(o, S, c);
            D(_, new Uint8Array(m.buffer, m.byteOffset, m.byteLength)), p = _;
          } else w = m.byteLength, p = s._malloc(w), n.push(p), s.HEAPU8.set(new Uint8Array(m.buffer, m.byteOffset, w), p);
        } else w = m.byteLength, p = s._malloc(w), n.push(p), s.HEAPU8.set(new Uint8Array(m.buffer, m.byteOffset, w), p);
      }
    }
    let b = s.stackSave(), O = s.stackAlloc(4 * c.length);
    try {
      c.forEach((h, P) => s.setValue(O + P * u, h, u === 4 ? "i32" : "i64"));
      let m = s._OrtCreateTensor(re(f), p, w, O, c.length, an(d));
      m === 0 && T(`Can't create tensor for input/output. session=${o}, index=${i}.`), t.push(m);
    } finally {
      s.stackRestore(b);
    }
  }, Le = async (e, t, n, o, r, i) => {
    let a = A(), s = a.PTR_SIZE, u = se.get(e);
    if (!u) throw new Error(`cannot run inference. invalid session id: ${e}`);
    let f = u[0], c = u[1], l = u[2], d = u[3], p = u[4], w = u[5], b = t.length, O = o.length, m = 0, h = [], P = [], g = [], S = [], B = a.stackSave(), D = a.stackAlloc(b * s), _ = a.stackAlloc(b * s), te = a.stackAlloc(O * s), ue = a.stackAlloc(O * s);
    try {
      [m, h] = en(i);
      for (let y = 0; y < b; y++) await fn(n[y], P, S, e, c[t[y]], t[y], p);
      for (let y = 0; y < O; y++) await fn(r[y], g, S, e, l[o[y]], b + o[y], p);
      for (let y = 0; y < b; y++) a.setValue(D + y * s, P[y], "*"), a.setValue(_ + y * s, c[t[y]], "*");
      for (let y = 0; y < O; y++) a.setValue(te + y * s, g[y], "*"), a.setValue(ue + y * s, l[o[y]], "*");
      a.jsepOnRunStart?.(f), a.webnnOnRunStart?.(f);
      let k;
      k = await a._OrtRun(f, _, D, b, ue, O, te, m), k !== 0 && T("failed to call OrtRun().");
      let $ = [], ut = [];
      for (let y = 0; y < O; y++) {
        let z = Number(a.getValue(te + y * s, "*"));
        if (z === g[y]) {
          $.push(r[y]);
          continue;
        }
        let ft = a.stackSave(), G = a.stackAlloc(4 * s), ne = false, L, M = 0;
        try {
          a._OrtGetTensorData(z, G, G + s, G + 2 * s, G + 3 * s) !== 0 && T(`Can't access output tensor data on index ${y}.`);
          let ze = s === 4 ? "i32" : "i64", he = Number(a.getValue(G, ze));
          M = a.getValue(G + s, "*");
          let ct = a.getValue(G + s * 2, "*"), Sn = Number(a.getValue(G + s * 3, ze)), H = [];
          for (let v = 0; v < Sn; v++) H.push(Number(a.getValue(ct + v * s, ze)));
          a._OrtFree(ct) !== 0 && T("Can't free memory for tensor dims.");
          let j = H.reduce((v, x) => v * x, 1);
          L = Ce(he);
          let fe = d?.outputPreferredLocations[o[y]];
          if (L === "string") {
            if (fe === "gpu-buffer" || fe === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
            let v = [];
            for (let x = 0; x < j; x++) {
              let V = a.getValue(M + x * s, "*"), ye = a.getValue(M + (x + 1) * s, "*"), dt = x === j - 1 ? void 0 : ye - V;
              v.push(a.UTF8ToString(V, dt));
            }
            $.push([L, H, v, "cpu"]);
          } else if (fe === "gpu-buffer" && j > 0) {
            let v = a.jsepGetBuffer;
            if (!v) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
            let x = v(M), V = oe(he, j);
            if (V === void 0 || !Re(L)) throw new Error(`Unsupported data type: ${L}`);
            ne = true, $.push([L, H, { gpuBuffer: x, download: a.jsepCreateDownloader(x, V, L), dispose: () => {
              a._OrtReleaseTensor(z) !== 0 && T("Can't release tensor.");
            } }, "gpu-buffer"]);
          } else if (fe === "ml-tensor" && j > 0) {
            let v = a.webnnEnsureTensor, x = a.webnnIsGraphInputOutputTypeSupported;
            if (!v || !x) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
            if (oe(he, j) === void 0 || !Fe(L)) throw new Error(`Unsupported data type: ${L}`);
            if (!x(e, L, false)) throw new Error(`preferredLocation "ml-tensor" for ${L} output is not supported by current WebNN Context.`);
            let ye = await v(e, M, he, H, false);
            ne = true, $.push([L, H, { mlTensor: ye, download: a.webnnCreateMLTensorDownloader(M, L), dispose: () => {
              a.webnnReleaseTensorId(M), a._OrtReleaseTensor(z);
            } }, "ml-tensor"]);
          } else if (fe === "ml-tensor-cpu-output" && j > 0) {
            let v = a.webnnCreateMLTensorDownloader(M, L)(), x = $.length;
            ne = true, ut.push((async () => {
              let V = [x, await v];
              return a.webnnReleaseTensorId(M), a._OrtReleaseTensor(z), V;
            })()), $.push([L, H, [], "cpu"]);
          } else {
            let v = on(L), x = new v(j);
            new Uint8Array(x.buffer, x.byteOffset, x.byteLength).set(a.HEAPU8.subarray(M, M + x.byteLength)), $.push([L, H, x, "cpu"]);
          }
        } finally {
          a.stackRestore(ft), L === "string" && M && a._free(M), ne || a._OrtReleaseTensor(z);
        }
      }
      d && !p && (a._OrtClearBoundOutputs(d.handle) !== 0 && T("Can't clear bound outputs."), se.set(e, [f, c, l, d, p, false]));
      for (let [y, z] of await Promise.all(ut)) $[y][2] = z;
      return $;
    } finally {
      a.webnnOnRunEnd?.(f), a.stackRestore(B), P.forEach((k) => a._OrtReleaseTensor(k)), g.forEach((k) => a._OrtReleaseTensor(k)), S.forEach((k) => a._free(k)), m !== 0 && a._OrtReleaseRunOptions(m), h.forEach((k) => a._free(k));
    }
  }, ve = (e) => {
    let t = A(), n = se.get(e);
    if (!n) throw new Error("invalid session id");
    let o = n[0], r = t._OrtEndProfiling(o);
    r === 0 && T("Can't get an profile file name."), t._OrtFree(r);
  }, Be = (e) => {
    let t = [];
    for (let n of e) {
      let o = n[2];
      !Array.isArray(o) && "buffer" in o && t.push(o.buffer);
    }
    return t;
  };
});
var ee;
var N;
var we;
var Ne;
var We;
var ke;
var st;
var at;
var ae;
var ie;
var jn;
var cn;
var dn;
var ln;
var pn;
var mn;
var wn;
var hn;
var it = E(() => {
  "use strict";
  X();
  Qe();
  K();
  Se();
  ee = () => !!I.wasm.proxy && typeof document < "u", we = false, Ne = false, We = false, at = /* @__PURE__ */ new Map(), ae = (e, t) => {
    let n = at.get(e);
    n ? n.push(t) : at.set(e, [t]);
  }, ie = () => {
    if (we || !Ne || We || !N) throw new Error("worker not ready");
  }, jn = (e) => {
    switch (e.data.type) {
      case "init-wasm":
        we = false, e.data.err ? (We = true, st[1](e.data.err)) : (Ne = true, st[0]()), ke && (URL.revokeObjectURL(ke), ke = void 0);
        break;
      case "init-ep":
      case "copy-from":
      case "create":
      case "release":
      case "run":
      case "end-profiling": {
        let t = at.get(e.data.type);
        e.data.err ? t.shift()[1](e.data.err) : t.shift()[0](e.data.out);
        break;
      }
      default:
    }
  }, cn = async () => {
    if (!Ne) {
      if (we) throw new Error("multiple calls to 'initWasm()' detected.");
      if (We) throw new Error("previous call to 'initWasm()' failed.");
      if (we = true, ee()) return new Promise((e, t) => {
        N?.terminate(), Xt().then(([n, o]) => {
          try {
            N = o, N.onerror = (i) => t(i), N.onmessage = jn, st = [e, t];
            let r = { type: "init-wasm", in: I };
            if (!r.in.wasm.wasmPaths && n) {
              let i = Ue();
              i && (r.in.wasm.wasmPaths = i);
            }
            N.postMessage(r), ke = n;
          } catch (r) {
            t(r);
          }
        }, t);
      });
      try {
        await Ae(I.wasm), await Oe(I), Ne = true;
      } catch (e) {
        throw We = true, e;
      } finally {
        we = false;
      }
    }
  }, dn = async (e) => {
    if (ee()) return ie(), new Promise((t, n) => {
      ae("init-ep", [t, n]);
      let o = { type: "init-ep", in: { epName: e, env: I } };
      N.postMessage(o);
    });
    await Ie(I, e);
  }, ln = async (e) => ee() ? (ie(), new Promise((t, n) => {
    ae("copy-from", [t, n]);
    let o = { type: "copy-from", in: { buffer: e } };
    N.postMessage(o, [e.buffer]);
  })) : le(e), pn = async (e, t) => {
    if (ee()) {
      if (t?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
      return ie(), new Promise((n, o) => {
        ae("create", [n, o]);
        let r = { type: "create", in: { model: e, options: { ...t } } }, i = [];
        e instanceof Uint8Array && i.push(e.buffer), N.postMessage(r, i);
      });
    } else return Pe(e, t);
  }, mn = async (e) => {
    if (ee()) return ie(), new Promise((t, n) => {
      ae("release", [t, n]);
      let o = { type: "release", in: e };
      N.postMessage(o);
    });
    xe(e);
  }, wn = async (e, t, n, o, r, i) => {
    if (ee()) {
      if (n.some((a) => a[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
      if (r.some((a) => a)) throw new Error("pre-allocated output tensor is not supported for proxy.");
      return ie(), new Promise((a, s) => {
        ae("run", [a, s]);
        let u = n, f = { type: "run", in: { sessionId: e, inputIndices: t, inputs: u, outputIndices: o, options: i } };
        N.postMessage(f, Be(u));
      });
    } else return Le(e, t, n, o, r, i);
  }, hn = async (e) => {
    if (ee()) return ie(), new Promise((t, n) => {
      ae("end-profiling", [t, n]);
      let o = { type: "end-profiling", in: e };
      N.postMessage(o);
    });
    ve(e);
  };
});
var yn;
var Vn;
var Ge;
var bn = E(() => {
  "use strict";
  X();
  it();
  rt();
  Te();
  ot();
  yn = (e, t) => {
    switch (e.location) {
      case "cpu":
        return [e.type, e.dims, e.data, "cpu"];
      case "gpu-buffer":
        return [e.type, e.dims, { gpuBuffer: e.gpuBuffer }, "gpu-buffer"];
      case "ml-tensor":
        return [e.type, e.dims, { mlTensor: e.mlTensor }, "ml-tensor"];
      default:
        throw new Error(`invalid data location: ${e.location} for ${t()}`);
    }
  }, Vn = (e) => {
    switch (e[3]) {
      case "cpu":
        return new W(e[0], e[2], e[1]);
      case "gpu-buffer": {
        let t = e[0];
        if (!Re(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
        let { gpuBuffer: n, download: o, dispose: r } = e[2];
        return W.fromGpuBuffer(n, { dataType: t, dims: e[1], download: o, dispose: r });
      }
      case "ml-tensor": {
        let t = e[0];
        if (!Fe(t)) throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);
        let { mlTensor: n, download: o, dispose: r } = e[2];
        return W.fromMLTensor(n, { dataType: t, dims: e[1], download: o, dispose: r });
      }
      default:
        throw new Error(`invalid data location: ${e[3]}`);
    }
  }, Ge = class {
    async fetchModelAndCopyToWasmMemory(t) {
      return ln(await me(t));
    }
    async loadModel(t, n) {
      J();
      let o;
      typeof t == "string" ? o = await this.fetchModelAndCopyToWasmMemory(t) : o = t, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await pn(o, n), Z();
    }
    async dispose() {
      return mn(this.sessionId);
    }
    async run(t, n, o) {
      J();
      let r = [], i = [];
      Object.entries(t).forEach((d) => {
        let p = d[0], w = d[1], b = this.inputNames.indexOf(p);
        if (b === -1) throw new Error(`invalid input '${p}'`);
        r.push(w), i.push(b);
      });
      let a = [], s = [];
      Object.entries(n).forEach((d) => {
        let p = d[0], w = d[1], b = this.outputNames.indexOf(p);
        if (b === -1) throw new Error(`invalid output '${p}'`);
        a.push(w), s.push(b);
      });
      let u = r.map((d, p) => yn(d, () => `input "${this.inputNames[i[p]]}"`)), f = a.map((d, p) => d ? yn(d, () => `output "${this.outputNames[s[p]]}"`) : null), c = await wn(this.sessionId, i, u, s, f, o), l = {};
      for (let d = 0; d < c.length; d++) l[this.outputNames[s[d]]] = a[d] ?? Vn(c[d]);
      return Z(), l;
    }
    startProfiling() {
    }
    endProfiling() {
      hn(this.sessionId);
    }
  };
});
var En = {};
Ve(En, { OnnxruntimeWebAssemblyBackend: () => $e, initializeFlags: () => gn, wasmBackend: () => Yn });
var gn;
var $e;
var Yn;
var Tn = E(() => {
  "use strict";
  X();
  it();
  bn();
  gn = () => {
    (typeof I.wasm.initTimeout != "number" || I.wasm.initTimeout < 0) && (I.wasm.initTimeout = 0);
    let e = I.wasm.simd;
    if (typeof e != "boolean" && e !== void 0 && e !== "fixed" && e !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`), I.wasm.simd = false), typeof I.wasm.proxy != "boolean" && (I.wasm.proxy = false), typeof I.wasm.trace != "boolean" && (I.wasm.trace = false), typeof I.wasm.numThreads != "number" || !Number.isInteger(I.wasm.numThreads) || I.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) I.wasm.numThreads = 1;
    else {
      let t = typeof navigator > "u" ? je("node:os").cpus().length : navigator.hardwareConcurrency;
      I.wasm.numThreads = Math.min(4, Math.ceil((t || 1) / 2));
    }
  }, $e = class {
    async init(t) {
      gn(), await cn(), await dn(t);
    }
    async createInferenceSessionHandler(t, n) {
      let o = new Ge();
      return await o.loadModel(t, n), o;
    }
  }, Yn = new $e();
});
X();
X();
X();
var $t = "1.22.0";
{
  let e = (Tn(), lt(En)).wasmBackend;
  ce("cpu", e, 10), ce("wasm", e, 10);
}
Object.defineProperty(I.versions, "web", { value: $t, enumerable: true });

// node_modules/@huggingface/tokenizers/dist/tokenizers.mjs
var DictionarySplitter = class {
  /**
   * @param dictionary The dictionary of words to use for splitting.
   */
  constructor(dictionary) {
    this.trie = this._build_trie(dictionary);
  }
  /**
   * Builds a trie from the given dictionary.
   * @param dictionary The dictionary of words to build the trie from.
   * @returns The root node of the trie.
   * @private
   */
  _build_trie(dictionary) {
    const trie = /* @__PURE__ */ Object.create(null);
    for (const word of dictionary) {
      let node = trie;
      for (let i = 0; i < word.length; ++i) {
        const char = word[i];
        node = node[char] ??= /* @__PURE__ */ Object.create(null);
      }
      node.end = word;
    }
    return trie;
  }
  /**
   * Splits the input text into tokens based on the dictionary.
   * @param text The input text to split.
   * @returns An array of tokens.
   */
  split(text) {
    const result = [];
    const n = text.length;
    let start = 0;
    let i = 0;
    while (i < n) {
      let node = this.trie;
      let match = null;
      let j = i;
      while (j < n && (node = node[text[j]])) {
        if (node.end) {
          match = node.end;
        }
        ++j;
      }
      if (match) {
        if (i > start) {
          result.push(text.slice(start, i));
        }
        result.push(match);
        i += match.length;
        start = i;
      } else {
        ++i;
      }
    }
    if (start < n) {
      result.push(text.slice(start));
    }
    return result;
  }
};
var DictionarySplitter_default = DictionarySplitter;
var AddedToken = class {
  /**
   * Creates a new instance of AddedToken.
   * @param config Added token configuration object.
   */
  constructor(config) {
    this.content = config.content;
    this.id = config.id;
    this.single_word = config.single_word ?? false;
    this.lstrip = config.lstrip ?? false;
    this.rstrip = config.rstrip ?? false;
    this.special = config.special ?? false;
    this.normalized = config.normalized ?? !this.special;
  }
};
var AddedToken_default = AddedToken;
var compile_unicode_regexp = (source, flags) => {
  try {
    return new RegExp(source, flags);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    const property_names = /* @__PURE__ */ new Map();
    const rewritten = source.replace(
      /(\\[pP])\{([^}=]+)\}/g,
      (text, p, n, offset) => {
        let preceding_backslashes = 0;
        for (let i = offset - 1; i >= 0 && source[i] === "\\"; --i) {
          ++preceding_backslashes;
        }
        if (preceding_backslashes % 2 === 1) return text;
        let property_name = property_names.get(n);
        if (property_name === void 0) {
          try {
            new RegExp(`\\p{${n}}`, "u");
            property_name = n;
          } catch {
            property_name = `Script=${n}`;
          }
          property_names.set(n, property_name);
        }
        return `${p}{${property_name}}`;
      }
    );
    if (rewritten === source) throw error;
    try {
      return new RegExp(rewritten, flags);
    } catch {
      throw error;
    }
  }
};
var clean_up_tokenization = (text) => text.replace(/ \./g, ".").replace(/ \?/g, "?").replace(/ \!/g, "!").replace(/ ,/g, ",").replace(/ \' /g, "'").replace(/ n't/g, "n't").replace(/ 'm/g, "'m").replace(/ 's/g, "'s").replace(/ 've/g, "'ve").replace(/ 're/g, "'re");
var create_pattern = (pattern, invert = true) => {
  if (pattern.Regex !== void 0) {
    const regex = rewrite_oniguruma_to_js(
      normalize_bloom_split_char_class(pattern.Regex)
    );
    return compile_unicode_regexp(regex, "gu");
  } else if (pattern.String !== void 0) {
    const escaped = escape_reg_exp(pattern.String);
    return new RegExp(invert ? escaped : `(${escaped})`, "gu");
  } else {
    console.warn("Unknown pattern type:", pattern);
    return null;
  }
};
var UNICODE_WORD_CHARS_IN_CLASS = "\\p{Alphabetic}\\p{M}\\p{Nd}\\p{Pc}";
var UNICODE_WORD_CHARS = `${UNICODE_WORD_CHARS_IN_CLASS}\\u00B2\\u00B3\\u00B9\\u00BC-\\u00BE`;
var UNICODE_WORD_CLASS = `[${UNICODE_WORD_CHARS}]`;
var UNICODE_NON_WORD_CLASS = `[^${UNICODE_WORD_CHARS}]`;
var UNICODE_WORD_BOUNDARY = `(?:(?<!${UNICODE_WORD_CLASS})(?=${UNICODE_WORD_CLASS})|(?<=${UNICODE_WORD_CLASS})(?!${UNICODE_WORD_CLASS}))`;
var UNICODE_NON_WORD_BOUNDARY = `(?:(?<!${UNICODE_WORD_CLASS})(?!${UNICODE_WORD_CLASS})|(?<=${UNICODE_WORD_CLASS})(?=${UNICODE_WORD_CLASS}))`;
var LINE_START_ANCHOR = "(?:(?<![\\s\\S])|(?<=\\n))";
var LINE_END_ANCHOR = "(?:(?=\\n)|(?![\\s\\S]))";
var HEX_DIGIT_CHARS = "0-9A-Fa-f";
var ESCAPE_REWRITES = /* @__PURE__ */ new Map([
  ["A", "(?<![\\s\\S])"],
  ["z", "(?![\\s\\S])"],
  ["Z", "(?=\\n?(?![\\s\\S]))"],
  // \Z permits a single optional final \n (not \r\n)
  ["h", `[${HEX_DIGIT_CHARS}]`],
  ["H", `[^${HEX_DIGIT_CHARS}]`],
  ["w", UNICODE_WORD_CLASS],
  ["W", UNICODE_NON_WORD_CLASS],
  ["d", "\\p{Nd}"],
  ["D", "\\P{Nd}"],
  ["s", "\\p{White_Space}"],
  // JS \s wrongly adds U+FEFF and misses \x85
  ["S", "\\P{White_Space}"],
  ["b", UNICODE_WORD_BOUNDARY],
  ["B", UNICODE_NON_WORD_BOUNDARY],
  ["a", "\\x07"],
  ["e", "\\x1B"]
]);
var CLASS_ESCAPE_REWRITES = /* @__PURE__ */ new Map([
  ["h", HEX_DIGIT_CHARS],
  ["w", UNICODE_WORD_CHARS_IN_CLASS],
  ["d", "\\p{Nd}"],
  ["D", "\\P{Nd}"],
  ["s", "\\p{White_Space}"],
  ["S", "\\P{White_Space}"],
  ["a", "\\x07"],
  ["e", "\\x1B"]
]);
var CLASS_COMPLEMENT_ALTERNATIVES = /* @__PURE__ */ new Map([
  ["W", `[^${UNICODE_WORD_CHARS_IN_CLASS}]`],
  ["H", `[^${HEX_DIGIT_CHARS}]`]
]);
var RAW_WHITESPACE_ESCAPES = /* @__PURE__ */ new Map([
  ["\n", "\\n"],
  ["\r", "\\r"],
  ["	", "\\t"],
  ["\f", "\\f"],
  ["\v", "\\v"]
]);
var POSIX_CLASS_FRAGMENTS = /* @__PURE__ */ new Map([
  ["alpha", "\\p{Alphabetic}"],
  ["alnum", "\\p{Alphabetic}\\p{Nd}"],
  ["digit", "\\p{Nd}"],
  ["lower", "\\p{Lowercase}"],
  ["upper", "\\p{Uppercase}"],
  ["space", "\\p{White_Space}"],
  ["blank", "\\t\\p{Zs}"],
  ["punct", "\\p{P}\\p{S}"],
  ["cntrl", "\\p{Cc}"],
  ["word", UNICODE_WORD_CHARS_IN_CLASS],
  ["xdigit", HEX_DIGIT_CHARS]
]);
var JS_SYNTAX_CHARS = "^$\\.*+?()[]{}|/";
var GROUP_PREFIX_RE = /^\(\?(?:<[=!]|<[A-Za-z_][A-Za-z0-9_]*>|[:=!>])/;
var BRACED_ESCAPE_RE = /^\\([pPxu])\{([^}]*)\}/;
var QUANTIFIER_BRACE_RE = /^\{(\d+(?:,\d*)?|,\d+)\}/;
var POSIX_BRACKET_RE = /^\[:(\^?)(\p{Alphabetic}+):\]/u;
var EMPTY_NEGATED_POSIX_BRACKET_RE = /^\[:\^:\]/;
var UNSUPPORTED_POSIX_BRACKET_RE = /^\[(?:\.[^\]]*\.\]|=[^\]]*=\])/;
var FIXED_WIDTH_ESCAPE_RE = /^(?:\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|\\c[A-Za-z])/;
var is_ascii_letter = (char) => char >= "A" && char <= "Z" || char >= "a" && char <= "z";
var character_at = (text, index) => String.fromCodePoint(text.codePointAt(index));
var get_ascii_folded_hex_atom = (hex) => {
  if (!/^[0-9A-Fa-f]{1,8}$/.test(hex)) return null;
  const code_point = Number.parseInt(hex, 16);
  if (code_point > 127) return null;
  const letter = String.fromCharCode(code_point);
  return is_ascii_letter(letter) ? `[${letter.toLowerCase()}${letter.toUpperCase()}]` : null;
};
var normalize_bloom_split_char_class = (regex) => regex.replace(/\[\^\(\\s\|\[([^\]]+)\]\)\]/g, "[^()|\\s$1]");
var ANY_CODE_POINT = "[\\s\\S]";
var MAX_CHARACTER_CLASS_NESTING_DEPTH = 256;
var create_character_class_operand = () => ({
  fragment: "",
  alternatives: [],
  tail: null,
  contains_complex_set: false
});
var throw_character_class_range_error = (index) => {
  throw new SyntaxError(
    `Unsupported range with a set-valued character-class operand at index ${index}`
  );
};
var add_character_class_atom = (operand, atom, index, contains_complex_set = true) => {
  if (operand.tail === "range") throw_character_class_range_error(index);
  operand.alternatives.push(atom);
  operand.tail = "set";
  operand.contains_complex_set = operand.contains_complex_set || contains_complex_set;
};
var append_character_class_fragment = (operand, fragment, set_valued = false, index = -1) => {
  if (set_valued && operand.tail === "range") {
    throw_character_class_range_error(index);
  }
  if (operand.tail === "range") {
    operand.fragment += fragment;
    operand.tail = "complete_range";
    return;
  }
  operand.fragment += fragment;
  operand.tail = set_valued ? "set" : "scalar";
  operand.contains_complex_set = operand.contains_complex_set || set_valued;
};
var rewrite_character_class_escape = (regex, index, operand) => {
  const braced = BRACED_ESCAPE_RE.exec(regex.slice(index));
  if (braced) {
    const [text, kind, body] = braced;
    if (kind === "P" && body === "Word") {
      add_character_class_atom(
        operand,
        `[^${UNICODE_WORD_CHARS_IN_CLASS}]`,
        index
      );
    } else {
      const replacement2 = kind === "x" ? `\\u{${body}}` : kind === "p" && body === "Word" ? UNICODE_WORD_CHARS_IN_CLASS : text;
      append_character_class_fragment(
        operand,
        replacement2,
        kind === "p" || kind === "P",
        index
      );
    }
    return index + text.length;
  }
  const fixed_width = FIXED_WIDTH_ESCAPE_RE.exec(regex.slice(index));
  if (fixed_width) {
    append_character_class_fragment(operand, fixed_width[0]);
    return index + fixed_width[0].length;
  }
  if (index + 1 >= regex.length) {
    throw new SyntaxError(
      `Unterminated escape in character class at index ${index}`
    );
  }
  const next = character_at(regex, index + 1);
  const next_end = index + 1 + next.length;
  const raw_whitespace = RAW_WHITESPACE_ESCAPES.get(next);
  if (raw_whitespace !== void 0) {
    append_character_class_fragment(operand, raw_whitespace);
    return next_end;
  }
  const complement = CLASS_COMPLEMENT_ALTERNATIVES.get(next);
  if (complement !== void 0) {
    add_character_class_atom(operand, complement, index);
    return next_end;
  }
  const rewrite = CLASS_ESCAPE_REWRITES.get(next);
  let replacement;
  let set_valued = false;
  if (rewrite !== void 0) {
    replacement = rewrite;
    set_valued = next !== "a" && next !== "e";
  } else if (/[A-Za-z0-9]/.test(next)) {
    replacement = `\\${next}`;
  } else if (JS_SYNTAX_CHARS.includes(next) || next === "-") {
    replacement = `\\${next}`;
  } else {
    replacement = next;
  }
  append_character_class_fragment(operand, replacement, set_valued, index);
  return next_end;
};
var compile_character_set_union = (pieces) => {
  if (pieces.length === 1) return pieces[0];
  return `(?:(?=(?:${pieces.join("|")}))${ANY_CODE_POINT})`;
};
var compile_character_class_operand = (operand) => {
  const pieces = operand.fragment.length === 0 ? operand.alternatives : [`[${operand.fragment}]`, ...operand.alternatives];
  return compile_character_set_union(pieces);
};
var get_ascii_fold_additions = (positive_atom) => {
  const membership = compile_unicode_regexp(`^(?:${positive_atom})$`, "u");
  let additions = "";
  for (let offset = 0; offset < 26; ++offset) {
    const upper = String.fromCharCode(65 + offset);
    const lower = String.fromCharCode(97 + offset);
    const has_upper = membership.test(upper);
    const has_lower = membership.test(lower);
    if (has_upper !== has_lower) additions += has_upper ? lower : upper;
  }
  return additions;
};
var parse_character_class = (regex, start, ascii_fold, apply_ascii_fold = true, nesting_depth = 1) => {
  if (nesting_depth > MAX_CHARACTER_CLASS_NESTING_DEPTH) {
    throw new SyntaxError(
      `Maximum character-class nesting depth of ${MAX_CHARACTER_CLASS_NESTING_DEPTH} exceeded at index ${start}`
    );
  }
  let i = start + 1;
  const negated = regex[i] === "^";
  if (negated) ++i;
  const first_content_index = i;
  const operands = [create_character_class_operand()];
  let operand = operands[0];
  let contains_nested_negated_complex_set = false;
  while (i < regex.length) {
    const char = character_at(regex, i);
    if (char === "\\") {
      i = rewrite_character_class_escape(regex, i, operand);
      continue;
    }
    if (char === "]") {
      if (i === first_content_index) {
        append_character_class_fragment(operand, "\\]");
        ++i;
        continue;
      }
      if (operand.tail === null) {
        if (operands.length > 1) {
          throw new SyntaxError(
            `Malformed character-class intersection with an empty operand at index ${i}`
          );
        }
        throw new SyntaxError(`Empty character class at index ${start}`);
      }
      const contains_complex_set = operands.some(
        (candidate) => candidate.contains_complex_set
      );
      if (negated && operands.length > 1 && contains_nested_negated_complex_set) {
        throw new SyntaxError(
          `Unsupported outer-negated character-class intersection with a nested negated class containing a Unicode property, POSIX class, or shorthand at index ${start}`
        );
      }
      const first_atom = compile_character_class_operand(operands[0]);
      let positive_atom = first_atom;
      if (operands.length > 1) {
        let lookaheads = "";
        for (let j = 1; j < operands.length; ++j) {
          lookaheads += `(?=${compile_character_class_operand(operands[j])})`;
        }
        positive_atom = `(?:${lookaheads}${first_atom})`;
      }
      const is_direct_class = operands.length === 1 && operand.alternatives.length === 0;
      let direct_fragment = operand.fragment;
      if (ascii_fold && apply_ascii_fold) {
        const additions = get_ascii_fold_additions(positive_atom);
        if (additions.length > 0) {
          if (is_direct_class) {
            direct_fragment += additions;
            positive_atom = `[${direct_fragment}]`;
          } else {
            positive_atom = compile_character_set_union([
              positive_atom,
              `[${additions}]`
            ]);
          }
        }
      }
      const atom = negated ? is_direct_class ? `[^${direct_fragment}]` : `(?:(?!${positive_atom})${ANY_CODE_POINT})` : positive_atom;
      return {
        atom,
        end: i + 1,
        negated,
        contains_complex_set,
        contains_nested_negated_complex_set
      };
    }
    if (regex.startsWith("&&", i)) {
      if (operand.tail === null) {
        throw new SyntaxError(
          `Malformed character-class intersection with an empty operand at index ${i}`
        );
      }
      operand = create_character_class_operand();
      operands.push(operand);
      i += 2;
      continue;
    }
    if (char === "[") {
      const suffix = regex.slice(i);
      if (EMPTY_NEGATED_POSIX_BRACKET_RE.test(suffix)) {
        throw new SyntaxError(
          `Malformed empty negated POSIX character class at index ${i}`
        );
      }
      const posix = POSIX_BRACKET_RE.exec(suffix);
      if (posix) {
        const [, posix_negated, name] = posix;
        const fragment = POSIX_CLASS_FRAGMENTS.get(name);
        if (fragment === void 0) {
          throw new SyntaxError(
            `Unsupported POSIX character class "${name}" at index ${i}`
          );
        }
        if (ascii_fold && posix_negated && (name === "lower" || name === "upper")) {
          throw new SyntaxError(
            `Unsupported negated POSIX ${name} class inside an inline case-insensitive group`
          );
        }
        if (posix_negated) {
          add_character_class_atom(operand, `[^${fragment}]`, i);
        } else {
          append_character_class_fragment(operand, fragment, true, i);
        }
        i += posix[0].length;
        continue;
      }
      if (UNSUPPORTED_POSIX_BRACKET_RE.test(suffix)) {
        throw new SyntaxError(
          `Unsupported POSIX collating or equivalence bracket expression at index ${i}`
        );
      }
      const nested = parse_character_class(
        regex,
        i,
        ascii_fold,
        false,
        nesting_depth + 1
      );
      add_character_class_atom(
        operand,
        nested.atom,
        i,
        nested.contains_complex_set
      );
      contains_nested_negated_complex_set ||= nested.contains_nested_negated_complex_set || nested.negated && nested.contains_complex_set;
      i = nested.end;
      continue;
    }
    if (char === "-") {
      const is_terminal_literal = regex[i + 1] === "]" || regex.startsWith("&&", i + 1);
      if (operand.tail === "set" && !is_terminal_literal) {
        throw_character_class_range_error(i);
      }
      if (operand.tail === null || operand.tail === "range" || operand.tail === "complete_range" || is_terminal_literal) {
        append_character_class_fragment(operand, "\\-");
      } else {
        operand.fragment += "-";
        operand.tail = "range";
      }
      ++i;
      continue;
    }
    append_character_class_fragment(
      operand,
      char === "^" && operand.fragment.length === 0 ? "\\^" : char
    );
    i += char.length;
  }
  throw new SyntaxError(
    `${operands.length > 1 ? "Unterminated character-class intersection" : "Unterminated character class"} at index ${start}`
  );
};
var rewrite_oniguruma_to_js = (regex) => {
  let out = "";
  let atom_start = -1;
  let last_was_quantifier = false;
  let ascii_fold = false;
  const group_states = [];
  const emit_atom = (text) => {
    atom_start = out.length;
    out += text;
    last_was_quantifier = false;
  };
  for (let i = 0; i < regex.length; ) {
    const char = character_at(regex, i);
    if (char === "\\") {
      const braced = BRACED_ESCAPE_RE.exec(regex.slice(i));
      if (braced) {
        const [text, kind, body] = braced;
        let replacement2 = text;
        if (kind === "x") {
          const code_point_escape = `\\u{${body}}`;
          replacement2 = ascii_fold ? get_ascii_folded_hex_atom(body) ?? code_point_escape : code_point_escape;
        } else if (body === "Word") {
          replacement2 = kind === "p" ? UNICODE_WORD_CLASS : UNICODE_NON_WORD_CLASS;
        }
        emit_atom(replacement2);
        i += text.length;
        continue;
      }
      const fixed_width = FIXED_WIDTH_ESCAPE_RE.exec(regex.slice(i));
      if (fixed_width) {
        const text = fixed_width[0];
        const replacement2 = ascii_fold && text[1] !== "c" ? get_ascii_folded_hex_atom(text.slice(2)) ?? text : text;
        emit_atom(replacement2);
        i += text.length;
        continue;
      }
      if (i + 1 >= regex.length) {
        out += char;
        break;
      }
      const next = character_at(regex, i + 1);
      i += 1 + next.length;
      if (next === "G") {
        continue;
      }
      const raw_whitespace = RAW_WHITESPACE_ESCAPES.get(next);
      if (raw_whitespace !== void 0) {
        emit_atom(raw_whitespace);
        continue;
      }
      const rewrite = ESCAPE_REWRITES.get(next);
      let replacement;
      if (rewrite !== void 0) {
        replacement = rewrite;
      } else if (/[A-Za-z0-9]/.test(next)) {
        replacement = `\\${next}`;
      } else if (JS_SYNTAX_CHARS.includes(next)) {
        replacement = `\\${next}`;
      } else {
        replacement = next;
      }
      emit_atom(replacement);
      continue;
    }
    switch (char) {
      case "[": {
        const parsed = parse_character_class(regex, i, ascii_fold);
        emit_atom(parsed.atom);
        i = parsed.end;
        continue;
      }
      case "]":
        emit_atom("\\]");
        ++i;
        continue;
      case ".":
        emit_atom("[^\\n]");
        ++i;
        continue;
      case "^":
        emit_atom(LINE_START_ANCHOR);
        ++i;
        continue;
      case "$":
        emit_atom(LINE_END_ANCHOR);
        ++i;
        continue;
      case "(": {
        const inline_case_insensitive = regex.startsWith("(?i:", i);
        const source_prefix = inline_case_insensitive ? "(?i:" : GROUP_PREFIX_RE.exec(regex.slice(i))?.[0] ?? "(";
        const output_prefix = inline_case_insensitive ? "(?:" : source_prefix === "(?>" ? "(?:" : source_prefix;
        group_states.push([out.length, ascii_fold]);
        if (inline_case_insensitive) ascii_fold = true;
        out += output_prefix;
        last_was_quantifier = false;
        i += source_prefix.length;
        continue;
      }
      case ")":
        out += char;
        [atom_start, ascii_fold] = group_states.pop() ?? [-1, false];
        last_was_quantifier = false;
        ++i;
        continue;
      case "|":
        out += char;
        atom_start = -1;
        last_was_quantifier = false;
        ++i;
        continue;
      case "{": {
        const quant = QUANTIFIER_BRACE_RE.exec(regex.slice(i));
        if (!quant || atom_start < 0) {
          emit_atom("\\{");
          ++i;
          continue;
        }
        const body = quant[1].startsWith(",") ? `0${quant[1]}` : quant[1];
        i += quant[0].length;
        const following = regex[i];
        if (following === "+" || following === "*") {
          out = `${out.slice(0, atom_start)}(?:${out.slice(atom_start)}{${body}})${following}`;
          ++i;
        } else {
          out += `{${body}}`;
        }
        last_was_quantifier = true;
        continue;
      }
      case "}":
        emit_atom("\\}");
        ++i;
        continue;
      case "+":
        if (last_was_quantifier) {
          ++i;
          continue;
        }
        out += char;
        last_was_quantifier = true;
        ++i;
        continue;
      case "*":
      case "?":
        out += char;
        last_was_quantifier = true;
        ++i;
        continue;
      default:
        emit_atom(
          ascii_fold && is_ascii_letter(char) ? `[${char.toLowerCase()}${char.toUpperCase()}]` : char
        );
        i += char.length;
        continue;
    }
  }
  return out;
};
var escape_reg_exp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var fuse_unk = (arr, tokens_to_ids, unk_token_id) => {
  const fused = [];
  let i = 0;
  while (i < arr.length) {
    fused.push(arr[i]);
    const token_id = tokens_to_ids.get(arr[i]) ?? unk_token_id;
    if (token_id !== unk_token_id) {
      ++i;
      continue;
    }
    while (++i < arr.length && (tokens_to_ids.get(arr[i]) ?? unk_token_id) === unk_token_id) {
      if (tokens_to_ids.get(fused.at(-1)) !== unk_token_id) {
        fused[fused.length - 1] += arr[i];
      }
    }
  }
  return fused;
};
var is_chinese_char = (cp) => cp >= 19968 && cp <= 40959 || cp >= 13312 && cp <= 19903 || cp >= 131072 && cp <= 173791 || cp >= 173824 && cp <= 177983 || cp >= 177984 && cp <= 178207 || cp >= 178208 && cp <= 183983 || cp >= 63744 && cp <= 64255 || cp >= 194560 && cp <= 195103;
var is_integral_number = (x) => Number.isInteger(x) || typeof x === "bigint";
var len = (s) => {
  let length = 0;
  for (const c of s) ++length;
  return length;
};
var lowercase_and_remove_accents = (text) => remove_accents(text.toLowerCase());
var merge_arrays = (...arrs) => Array.prototype.concat.apply([], arrs);
var object_to_map = (obj) => new Map(Object.entries(obj));
var regex_split = (text, regex) => {
  const result = [];
  let prev = 0;
  for (const match of text.matchAll(regex)) {
    const full_match = match[0];
    if (prev < match.index) {
      result.push(text.slice(prev, match.index));
    }
    if (full_match.length > 0) {
      result.push(full_match);
    }
    prev = match.index + full_match.length;
  }
  if (prev < text.length) {
    result.push(text.slice(prev));
  }
  return result;
};
var remove_accents = (text) => text.replace(/\p{M}/gu, "");
var validate_object = (obj, name, required_keys = []) => {
  if (!obj || Array.isArray(obj) || typeof obj !== "object") {
    return `${name} must be a valid object`;
  }
  for (const key of required_keys) {
    if (!(key in obj)) {
      return `${name} must contain a "${key}" property`;
    }
  }
  return null;
};
var whitespace_split = (text) => text.match(/\S+/g) || [];
var Callable = class {
  /**
   * Creates a new instance of the Callable class.
   */
  constructor() {
    const closure = function(...args) {
      return closure._call(...args);
    };
    return Object.setPrototypeOf(closure, new.target.prototype);
  }
};
var Callable_default = Callable;
var Normalizer = class extends Callable_default {
  /**
   * @param config The configuration object for the normalizer.
   */
  constructor(config) {
    super();
    this.config = config;
  }
  /**
   * Alias for {@link Normalizer#normalize}.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  _call(text) {
    return this.normalize(text);
  }
};
var Normalizer_default = Normalizer;
var BertNormalizer = class extends Normalizer_default {
  /**
   * Adds whitespace around any CJK (Chinese, Japanese, or Korean) character in the input text.
   *
   * @param text The input text to tokenize.
   * @returns The tokenized text with whitespace added around CJK characters.
   */
  tokenize_chinese_chars(text) {
    const output = [];
    for (let i = 0; i < text.length; ++i) {
      const char = text[i];
      const cp = char.charCodeAt(0);
      if (is_chinese_char(cp)) {
        output.push(" ");
        output.push(char);
        output.push(" ");
      } else {
        output.push(char);
      }
    }
    return output.join("");
  }
  /**
   * Strips accents from the given text.
   * @param text The text to strip accents from.
   * @returns The text with accents removed.
   */
  strip_accents(text) {
    return text.normalize("NFD").replace(/\p{Mn}/gu, "");
  }
  /**
   * Checks whether `char` is a control character.
   * @param char The character to check.
   * @returns Whether `char` is a control character.
   */
  is_control(char) {
    switch (char) {
      case "	":
      case "\n":
      case "\r":
        return false;
      default:
        return /^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(char);
    }
  }
  /**
   * Performs invalid character removal and whitespace cleanup on text.
   * @param text The text to clean.
   * @returns The cleaned text.
   */
  clean_text(text) {
    const output = [];
    for (const char of text) {
      const cp = char.charCodeAt(0);
      if (cp === 0 || cp === 65533 || this.is_control(char)) {
        continue;
      }
      if (/^\s$/.test(char)) {
        output.push(" ");
      } else {
        output.push(char);
      }
    }
    return output.join("");
  }
  /**
   * Normalizes the given text based on the configuration.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    if (this.config.clean_text) {
      text = this.clean_text(text);
    }
    if (this.config.handle_chinese_chars) {
      text = this.tokenize_chinese_chars(text);
    }
    if (this.config.lowercase) {
      text = text.toLowerCase();
      if (this.config.strip_accents !== false) {
        text = this.strip_accents(text);
      }
    } else if (this.config.strip_accents) {
      text = this.strip_accents(text);
    }
    return text;
  }
};
var BertNormalizer_default = BertNormalizer;
var Precompiled = class extends Normalizer_default {
  /**
   * Create a new instance of Precompiled normalizer.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.charsmap = config.precompiled_charsmap ?? null;
  }
  /**
   * Normalizes the given text by applying the precompiled charsmap.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    text = text.replace(
      /[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,
      ""
    );
    text = text.replace(
      /[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm,
      " "
    );
    if (text.includes("\uFF5E")) {
      const parts = text.split("\uFF5E");
      text = parts.map((part) => part.normalize("NFKC")).join("\uFF5E");
    } else {
      text = text.normalize("NFKC");
    }
    return text;
  }
};
var Precompiled_default = Precompiled;
var Sequence = class extends Normalizer_default {
  /**
   * Create a new instance of NormalizerSequence.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.normalizers = (config.normalizers ?? []).map(
      (x) => create_normalizer_default(x)
    );
  }
  /**
   * Apply a sequence of Normalizers to the input text.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    return this.normalizers.reduce((t, normalizer) => {
      return normalizer ? normalizer.normalize(t) : t;
    }, text);
  }
};
var Sequence_default = Sequence;
var Replace = class extends Normalizer_default {
  /**
   * @param config The configuration object for the normalizer.
   */
  constructor(config) {
    super(config);
    this.pattern = create_pattern(this.config.pattern ?? {});
  }
  /**
   * Normalize the input text by replacing the pattern with the content.
   * @param text The input text to be normalized.
   * @returns The normalized text after replacing the pattern with the content.
   */
  normalize(text) {
    return this.pattern === null ? text : text.replaceAll(this.pattern, this.config.content ?? "");
  }
};
var Replace_default = Replace;
var UnicodeNormalizer = class extends Normalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFC";
  }
  /**
   * Normalize the input text by applying Unicode normalization.
   * @param text The input text to be normalized.
   * @returns The normalized text.
   */
  normalize(text) {
    text = text.normalize(this.form);
    return text;
  }
};
var UnicodeNormalizer_default = UnicodeNormalizer;
var NFC = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFC";
  }
};
var NFC_default = NFC;
var NFD = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFD";
  }
};
var NFD_default = NFD;
var NFKC = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFKC";
  }
};
var NFKC_default = NFKC;
var NFKD = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFKD";
  }
};
var NFKD_default = NFKD;
var Strip = class extends Normalizer_default {
  /**
   * Strip leading and/or trailing whitespace from the input text.
   * @param text The input text.
   * @returns The normalized text.
   */
  normalize(text) {
    if (this.config.strip_left && this.config.strip_right) {
      text = text.trim();
    } else {
      if (this.config.strip_left) {
        text = text.trimStart();
      }
      if (this.config.strip_right) {
        text = text.trimEnd();
      }
    }
    return text;
  }
};
var Strip_default = Strip;
var StripAccents = class extends Normalizer_default {
  /**
   * Remove all accents from the text.
   * @param text The input text.
   * @returns The normalized text without accents.
   */
  normalize(text) {
    return remove_accents(text);
  }
};
var StripAccents_default = StripAccents;
var Lowercase = class extends Normalizer_default {
  /**
   * Lowercases the input string.
   * @param {string} text The text to normalize.
   * @returns {string} The normalized text.
   */
  normalize(text) {
    return text.toLowerCase();
  }
};
var Lowercase_default = Lowercase;
var Prepend = class extends Normalizer_default {
  /**
   * Prepends the input string.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    text = this.config.prepend + text;
    return text;
  }
};
var Prepend_default = Prepend;
function create_normalizer(config) {
  if (config === null) return null;
  switch (config.type) {
    case "BertNormalizer":
      return new BertNormalizer_default(config);
    case "Precompiled":
      return new Precompiled_default(config);
    case "Sequence":
      return new Sequence_default(config);
    case "Replace":
      return new Replace_default(config);
    case "NFC":
      return new NFC_default(config);
    case "NFD":
      return new NFD_default(config);
    case "NFKC":
      return new NFKC_default(config);
    case "NFKD":
      return new NFKD_default(config);
    case "Strip":
      return new Strip_default(config);
    case "StripAccents":
      return new StripAccents_default(config);
    case "Lowercase":
      return new Lowercase_default(config);
    case "Prepend":
      return new Prepend_default(config);
    default:
      throw new Error(`Unknown Normalizer type: ${config.type}`);
  }
}
var create_normalizer_default = create_normalizer;
var PreTokenizer = class extends Callable_default {
  /**
   * Tokenizes the given text into pre-tokens.
   * @param text The text or array of texts to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of pre-tokens.
   */
  pre_tokenize(text, options) {
    return (Array.isArray(text) ? text.map((x) => this.pre_tokenize_text(x, options)) : this.pre_tokenize_text(text, options)).flat();
  }
  /**
   * Alias for {@link PreTokenizer#pre_tokenize}.
   * @param text The text or array of texts to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of pre-tokens.
   */
  _call(text, options) {
    return this.pre_tokenize(text, options);
  }
};
var PreTokenizer_default = PreTokenizer;
var BYTES_TO_UNICODE = (() => {
  const bs = [
    ...Array.from(
      { length: "~".charCodeAt(0) - "!".charCodeAt(0) + 1 },
      (_, i) => i + "!".charCodeAt(0)
    ),
    ...Array.from(
      { length: "\xAC".charCodeAt(0) - "\xA1".charCodeAt(0) + 1 },
      (_, i) => i + "\xA1".charCodeAt(0)
    ),
    ...Array.from(
      { length: "\xFF".charCodeAt(0) - "\xAE".charCodeAt(0) + 1 },
      (_, i) => i + "\xAE".charCodeAt(0)
    )
  ];
  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 256; ++b) {
    if (!bs.includes(b)) {
      bs.push(b);
      cs.push(256 + n);
      n += 1;
    }
  }
  const ccs = cs.map((n2) => String.fromCharCode(n2));
  return Object.fromEntries(bs.map((b, i) => [b, ccs[i]]));
})();
var reverse_dictionary = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));
var UNICODE_TO_BYTES = reverse_dictionary(BYTES_TO_UNICODE);
var PUNCTUATION_REGEX = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E";
var ByteLevel = class extends PreTokenizer_default {
  /**
   * Creates a new instance of the `ByteLevelPreTokenizer` class.
   * @param config The configuration object.
   */
  constructor(config) {
    super();
    this.config = config;
    this.add_prefix_space = this.config.add_prefix_space ?? false;
    this.trim_offsets = this.config.trim_offsets ?? false;
    this.use_regex = this.config.use_regex ?? true;
    this.pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
    this.byte_encoder = BYTES_TO_UNICODE;
    this.text_encoder = new TextEncoder();
  }
  /**
   * Tokenizes a single piece of text using byte-level tokenization.
   * @param text The text to tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text, options) {
    if (this.add_prefix_space && !text.startsWith(" ")) {
      text = " " + text;
    }
    const tokens = this.use_regex ? text.match(this.pattern) || [] : [text];
    return tokens.map(
      (token) => Array.from(
        this.text_encoder.encode(token),
        (byte) => this.byte_encoder[byte]
      ).join("")
    );
  }
};
var ByteLevel_default = ByteLevel;
var Whitespace = class extends PreTokenizer_default {
  /**
   * Pre-tokenizes the input text by splitting it on word boundaries.
   * @param text The text to be pre-tokenized.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens produced by splitting the input text on whitespace.
   */
  pre_tokenize_text(text, options) {
    return text.match(/\w+|[^\w\s]+/g) || [];
  }
};
var Whitespace_default = Whitespace;
var Metaspace = class extends PreTokenizer_default {
  /**
   * @param config The configuration object for the MetaspacePreTokenizer.
   */
  constructor(config) {
    super();
    this.replacement = config.replacement ?? "\u2581";
    this.str_rep = config.str_rep || this.replacement;
    this.prepend_scheme = config.prepend_scheme ?? "always";
  }
  /**
   * This method takes a string, replaces spaces with the replacement character,
   * adds a prefix space if requested, and returns a new list of tokens.
   * @param text The text to pre-tokenize.
   * @param options The options for the pre-tokenization.
   * @returns A new list of pre-tokenized tokens.
   */
  pre_tokenize_text(text, options) {
    const { section_index = void 0 } = options ?? {};
    let normalized = text.replaceAll(" ", this.str_rep);
    if (
      // We add a prefix space if:
      //  (1) The normalized token does not already start with the replacement character.
      !normalized.startsWith(this.replacement) && // and (2) either:
      //  (a) prepend_scheme is 'always'
      //  (b) prepend_scheme is 'first' and this is the first section
      (this.prepend_scheme === "always" || this.prepend_scheme === "first" && section_index === 0)
    ) {
      normalized = this.str_rep + normalized;
    }
    return [normalized];
  }
};
var Metaspace_default = Metaspace;
var Split = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = create_pattern(
      this.config.pattern ?? {},
      this.config.invert ?? true
    );
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    if (this.pattern === null) {
      return [];
    }
    if (this.config.invert) {
      return (text.match(this.pattern) || []).filter((x) => x);
    } else if (this.config.behavior?.toLowerCase() === "removed") {
      return text.split(this.pattern).filter((x) => x);
    } else {
      return regex_split(text, this.pattern);
    }
  }
};
var Split_default = Split;
var Punctuation = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = new RegExp(
      `[^${PUNCTUATION_REGEX}]+|[${PUNCTUATION_REGEX}]+`,
      "gu"
    );
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    return text.match(this.pattern) || [];
  }
};
var Punctuation_default = Punctuation;
var Digits = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    const digit_pattern = `[^\\d]+|\\d${this.config.individual_digits ? "" : "+"}`;
    this.pattern = new RegExp(digit_pattern, "gu");
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    return text.match(this.pattern) || [];
  }
};
var Digits_default = Digits;
var BertPreTokenizer = class extends PreTokenizer_default {
  /**
   * A PreTokenizer that splits text into wordpieces using a basic tokenization scheme
   * similar to that used in the original implementation of BERT.
   */
  constructor() {
    super();
    this.pattern = new RegExp(
      `[^\\s${PUNCTUATION_REGEX}]+|[${PUNCTUATION_REGEX}]`,
      "gu"
    );
  }
  /**
   * Tokenizes a single text using the BERT pre-tokenization scheme.
   *
   * @param text The text to tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text, options) {
    return text.trim().match(this.pattern) || [];
  }
};
var BertPreTokenizer_default = BertPreTokenizer;
var Replace2 = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = create_pattern(this.config.pattern ?? {});
    this.content = this.config.content ?? "";
  }
  /**
   * Pre-tokenizes the input text by replacing certain characters.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by replacing certain characters.
   */
  pre_tokenize_text(text) {
    if (this.pattern === null) {
      return [text];
    }
    return [text.replaceAll(this.pattern, this.config.content ?? "")];
  }
};
var Replace_default2 = Replace2;
var Sequence2 = class extends PreTokenizer_default {
  /**
   * Creates an instance of PreTokenizerSequence.
   * @param config The configuration object for the pre-tokenizer sequence.
   */
  constructor(config) {
    super();
    this.tokenizers = (config.pretokenizers ?? []).map(
      (x) => create_pre_tokenizer_default(x)
    );
  }
  /**
   * Applies each pre-tokenizer in the sequence to the input text in turn.
   * @param text The text to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns The pre-tokenized text.
   */
  pre_tokenize_text(text, options) {
    return this.tokenizers.reduce(
      (pre_tokenized_text, tokenizer2) => {
        return tokenizer2 ? tokenizer2.pre_tokenize(pre_tokenized_text, options) : pre_tokenized_text;
      },
      [text]
    );
  }
};
var Sequence_default2 = Sequence2;
var WhitespaceSplit = class extends PreTokenizer_default {
  /**
   * Pre-tokenizes the input text by splitting it on whitespace characters.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by splitting the input text on whitespace.
   */
  pre_tokenize_text(text) {
    return whitespace_split(text);
  }
};
var WhitespaceSplit_default = WhitespaceSplit;
var FixedLength = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this._length = config.length;
  }
  /**
   * Pre-tokenizes the input text by splitting it into fixed-length tokens.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by splitting the input text into fixed-length tokens.
   */
  pre_tokenize_text(text) {
    const tokens = [];
    for (let i = 0; i < text.length; i += this._length) {
      tokens.push(text.slice(i, i + this._length));
    }
    return tokens;
  }
};
var FixedLength_default = FixedLength;
function create_pre_tokenizer(config) {
  if (config === null) return null;
  switch (config.type) {
    case "BertPreTokenizer":
      return new BertPreTokenizer_default();
    case "Sequence":
      return new Sequence_default2(config);
    case "Whitespace":
      return new Whitespace_default();
    case "WhitespaceSplit":
      return new WhitespaceSplit_default();
    case "Metaspace":
      return new Metaspace_default(config);
    case "ByteLevel":
      return new ByteLevel_default(config);
    case "Split":
      return new Split_default(config);
    case "Punctuation":
      return new Punctuation_default(config);
    case "Digits":
      return new Digits_default(config);
    case "Replace":
      return new Replace_default2(config);
    case "FixedLength":
      return new FixedLength_default(config);
    default:
      throw new Error(`Unknown PreTokenizer type: ${config.type}`);
  }
}
var create_pre_tokenizer_default = create_pre_tokenizer;
var TokenizerModel = class extends Callable_default {
  /**
   * Creates a new instance of TokenizerModel.
   * @param config The configuration object for the TokenizerModel.
   */
  constructor(config) {
    super();
    this.config = config;
    this.vocab = [];
    this.tokens_to_ids = /* @__PURE__ */ new Map();
    this.unk_token_id = void 0;
    this.unk_token = void 0;
    this.end_of_word_suffix = void 0;
    this.fuse_unk = this.config.fuse_unk ?? false;
  }
  /**
   * Internal function to call the TokenizerModel instance.
   * @param tokens The tokens to encode.
   * @returns The encoded tokens.
   */
  _call(tokens) {
    let result = this.encode(tokens);
    if (this.fuse_unk) {
      result = fuse_unk(result, this.tokens_to_ids, this.unk_token_id);
    }
    return result;
  }
};
var TokenizerModel_default = TokenizerModel;
var WordPieceTokenizer = class extends TokenizerModel_default {
  /**
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.max_input_chars_per_word = 100;
    this.tokens_to_ids = object_to_map(config.vocab);
    this.unk_token_id = this.tokens_to_ids.get(config.unk_token);
    this.unk_token = config.unk_token;
    this.max_input_chars_per_word = config.max_input_chars_per_word ?? 100;
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
  }
  /**
   * Encodes an array of tokens using WordPiece encoding.
   * @param tokens The tokens to encode.
   * @returns An array of encoded tokens.
   */
  encode(tokens) {
    const output_tokens = [];
    for (const token of tokens) {
      const chars = [...token];
      if (chars.length > this.max_input_chars_per_word) {
        output_tokens.push(this.unk_token);
        continue;
      }
      let is_unknown = false;
      let start = 0;
      const sub_tokens = [];
      while (start < chars.length) {
        let end = chars.length;
        let current_substring = null;
        while (start < end) {
          let substr = chars.slice(start, end).join("");
          if (start > 0) {
            substr = this.config.continuing_subword_prefix + substr;
          }
          if (this.tokens_to_ids.has(substr)) {
            current_substring = substr;
            break;
          }
          --end;
        }
        if (current_substring === null) {
          is_unknown = true;
          break;
        }
        sub_tokens.push(current_substring);
        start = end;
      }
      if (is_unknown) {
        output_tokens.push(this.unk_token);
      } else {
        output_tokens.push(...sub_tokens);
      }
    }
    return output_tokens;
  }
};
var WordPiece_default = WordPieceTokenizer;
var CharTrieNode = class _CharTrieNode {
  /**
   * Create a new CharTrieNode.
   * @param is_leaf Whether the node is a leaf node or not.
   * @param children A map containing the node's children, where the key is a character and the value is a `CharTrieNode`.
   */
  constructor(is_leaf, children) {
    this.is_leaf = is_leaf;
    this.children = children;
  }
  /**
   * Returns a new `CharTrieNode` instance with default values.
   * @returns A new `CharTrieNode` instance with `is_leaf` set to `false` and an empty `children` map.
   */
  static default() {
    return new _CharTrieNode(false, /* @__PURE__ */ new Map());
  }
};
var CharTrie = class {
  constructor() {
    this.root = CharTrieNode.default();
  }
  /**
   * Adds one or more `texts` to the trie.
   * @param texts The strings to add to the trie.
   */
  extend(texts) {
    for (const text of texts) {
      this.push(text);
    }
  }
  /**
   * Adds text to the trie.
   * @param text The string to add to the trie.
   */
  push(text) {
    let node = this.root;
    for (const ch of text) {
      let child = node.children.get(ch);
      if (child === void 0) {
        child = CharTrieNode.default();
        node.children.set(ch, child);
      }
      node = child;
    }
    node.is_leaf = true;
  }
  /**
   * Searches the trie for stored strings that match `chars` starting at `start`.
   * @param chars The input characters to search.
   * @param start The index to start searching from.
   * @yields Each stored string that is a prefix of `chars` starting at `start`.
   */
  *common_prefix_search(chars, start = 0) {
    let node = this.root;
    if (node === void 0) return;
    let prefix = "";
    for (let i = start; i < chars.length; ++i) {
      const ch = chars[i];
      prefix += ch;
      node = node.children.get(ch);
      if (node === void 0) return;
      if (node.is_leaf) {
        yield prefix;
      }
    }
  }
};
var CharTrie_default = CharTrie;
var TokenLatticeNode = class _TokenLatticeNode {
  /**
   * Represents a node in a token lattice for a given sentence.
   * @param token_id The ID of the token associated with this node.
   * @param node_id The ID of this node.
   * @param pos The starting position of the token in the sentence.
   * @param length The length of the token.
   * @param score The score associated with the token.
   */
  constructor(token_id, node_id, pos, length, score) {
    this.token_id = token_id;
    this.node_id = node_id;
    this.pos = pos;
    this.length = length;
    this.score = score;
    this.prev = null;
    this.backtrace_score = 0;
  }
  /**
   * Returns a clone of this node.
   * @returns A clone of this node.
   */
  clone() {
    const n = new _TokenLatticeNode(
      this.token_id,
      this.node_id,
      this.pos,
      this.length,
      this.score
    );
    n.prev = this.prev;
    n.backtrace_score = this.backtrace_score;
    return n;
  }
};
var TokenLattice = class {
  /**
   * Creates a new TokenLattice instance.
   *
   * @param sentence The input sentence to be tokenized.
   * @param bos_token_id The beginning-of-sequence token ID.
   * @param eos_token_id The end-of-sequence token ID.
   */
  constructor(sentence, bos_token_id, eos_token_id) {
    this.chars = Array.from(sentence);
    this.len = this.chars.length;
    this.bos_token_id = bos_token_id;
    this.eos_token_id = eos_token_id;
    this.nodes = [];
    this.begin_nodes = Array.from(
      { length: this.len + 1 },
      () => []
    );
    this.end_nodes = Array.from({ length: this.len + 1 }, () => []);
    const bos = new TokenLatticeNode(this.bos_token_id ?? 0, 0, 0, 0, 0);
    const eos = new TokenLatticeNode(
      this.eos_token_id ?? 0,
      1,
      this.len,
      0,
      0
    );
    this.nodes.push(bos.clone());
    this.nodes.push(eos.clone());
    this.begin_nodes[this.len].push(eos);
    this.end_nodes[0].push(bos);
  }
  /**
   * Inserts a new token node into the token lattice.
   *
   * @param pos The starting position of the token.
   * @param length The length of the token.
   * @param score The score of the token.
   * @param token_id The token ID of the token.
   */
  insert(pos, length, score, token_id) {
    const node_id = this.nodes.length;
    const node = new TokenLatticeNode(token_id, node_id, pos, length, score);
    this.begin_nodes[pos].push(node);
    this.end_nodes[pos + length].push(node);
    this.nodes.push(node);
  }
  /**
   * Implements the Viterbi algorithm to compute the most likely sequence of tokens.
   *
   * @returns The most likely sequence of tokens.
   */
  viterbi() {
    const len2 = this.len;
    let pos = 0;
    while (pos <= len2) {
      if (this.begin_nodes[pos].length == 0) {
        return [];
      }
      for (let rnode of this.begin_nodes[pos]) {
        rnode.prev = null;
        let best_score = 0;
        let best_node = null;
        for (let lnode of this.end_nodes[pos]) {
          const score = lnode.backtrace_score + rnode.score;
          if (best_node === null || score > best_score) {
            best_node = lnode.clone();
            best_score = score;
          }
        }
        if (best_node !== null) {
          rnode.prev = best_node;
          rnode.backtrace_score = best_score;
        } else {
          return [];
        }
      }
      ++pos;
    }
    const results = [];
    const root = this.begin_nodes[len2][0];
    const prev = root.prev;
    if (prev === null) {
      return [];
    }
    let node = prev.clone();
    while (node.prev !== null) {
      results.push(node.clone());
      const n = node.clone();
      node = n.prev.clone();
    }
    results.reverse();
    return results;
  }
  /**
   * Get the text piece for a given node.
   * @param node The node to get the piece for.
   * @returns The array of nodes representing the most likely sequence of tokens.
   */
  piece(node) {
    return this.chars.slice(node.pos, node.pos + node.length).join("");
  }
  /**
   * @returns The most likely sequence of tokens.
   */
  tokens() {
    const nodes = this.viterbi();
    return nodes.map((x) => this.piece(x));
  }
  /**
   * @returns The most likely sequence of token ids.
   */
  token_ids() {
    const nodes = this.viterbi();
    return nodes.map((x) => x.token_id);
  }
};
var TokenLattice_default = TokenLattice;
function min(arr) {
  if (arr.length === 0) throw new Error("Array must not be empty");
  let min_value = arr[0];
  let index_of_min = 0;
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < min_value) {
      min_value = arr[i];
      index_of_min = i;
    }
  }
  return [min_value, index_of_min];
}
var Unigram = class extends TokenizerModel_default {
  /**
   * Create a new Unigram tokenizer model.
   * @param config The configuration object for the Unigram model.
   * @param eos_token
   */
  constructor(config, eos_token) {
    super(config);
    const vocab_size = config.vocab.length;
    this.vocab = new Array(vocab_size);
    this.scores = new Array(vocab_size);
    for (let i = 0; i < vocab_size; ++i) {
      [this.vocab[i], this.scores[i]] = config.vocab[i];
    }
    this.unk_token_id = config.unk_id;
    this.unk_token = this.vocab[config.unk_id];
    this.tokens_to_ids = new Map(this.vocab.map((x, i) => [x, i]));
    this.bos_token = " ";
    this.bos_token_id = this.tokens_to_ids.get(this.bos_token);
    this.eos_token = eos_token;
    this.eos_token_id = this.tokens_to_ids.get(this.eos_token);
    this.unk_token = this.vocab[this.unk_token_id];
    this.min_score = min(this.scores)[0];
    this.unk_score = this.min_score - 10;
    this.scores[this.unk_token_id] = this.unk_score;
    this.trie = new CharTrie_default();
    this.trie.extend(this.vocab);
    this.fuse_unk = true;
  }
  /**
   * Populates lattice nodes.
   * @param lattice The token lattice to populate with nodes.
   */
  populate_nodes(lattice) {
    const chars = lattice.chars;
    const mblen = 1;
    let begin_pos = 0;
    while (begin_pos < chars.length) {
      let has_single_node = false;
      const prefixed_tokens = this.trie.common_prefix_search(chars, begin_pos);
      for (const token of prefixed_tokens) {
        const token_id = this.tokens_to_ids.get(token);
        const token_score = this.scores[token_id];
        const n = len(token);
        lattice.insert(begin_pos, n, token_score, token_id);
        if (!has_single_node && n === mblen) {
          has_single_node = true;
        }
      }
      if (!has_single_node) {
        lattice.insert(begin_pos, mblen, this.unk_score, this.unk_token_id);
      }
      begin_pos += mblen;
    }
  }
  /**
   * Encodes an array of tokens into an array of subtokens using the unigram model.
   *
   * @param normalized The normalized string.
   * @returns An array of subtokens obtained by encoding the input tokens using the unigram model.
   */
  tokenize(normalized) {
    const lattice = new TokenLattice_default(
      normalized,
      this.bos_token_id,
      this.eos_token_id
    );
    this.populate_nodes(lattice);
    return lattice.tokens();
  }
  /**
   * Encodes an array of tokens using Unigram encoding.
   * @param tokens The tokens to encode.
   * @returns An array of encoded tokens.
   */
  encode(tokens) {
    const to_return = [];
    for (const token of tokens) {
      const tokenized = this.tokenize(token);
      to_return.push(...tokenized);
    }
    return to_return;
  }
};
var Unigram_default = Unigram;
var PriorityQueue = class {
  /**
   * Create a new PriorityQueue.
   * @param comparator Comparator function to determine priority. Defaults to a MaxHeap.
   * @param max_size Maximum size of the queue. Defaults to Infinity.
   */
  constructor(comparator = (a, b) => a > b, max_size = Infinity) {
    this._heap = [];
    this._comparator = comparator;
    this._max_size = max_size;
  }
  /**
   * The size of the queue
   */
  get size() {
    return this._heap.length;
  }
  /**
   * Check if the queue is empty.
   * @returns `true` if the queue is empty, `false` otherwise.
   */
  is_empty() {
    return this.size === 0;
  }
  /**
   * Return the element with the highest priority in the queue.
   * @returns The highest priority element in the queue.
   */
  peek() {
    return this._heap[0];
  }
  /**
   * Add one or more elements to the queue.
   * @param values The values to push into the queue.
   * @returns The new size of the queue.
   */
  push(...values) {
    return this.extend(values);
  }
  /**
   * Add multiple elements to the queue.
   * @param values The values to push into the queue.
   * @returns The new size of the queue.
   */
  extend(values) {
    for (const value of values) {
      if (this.size < this._max_size) {
        this._heap.push(value);
        this._sift_up();
      } else {
        const smallest = this._smallest();
        if (this._comparator(value, this._heap[smallest])) {
          this._heap[smallest] = value;
          this._sift_up_from(smallest);
        }
      }
    }
    return this.size;
  }
  /**
   * Remove and return the element with the highest priority in the queue.
   * @returns The element with the highest priority in the queue.
   */
  pop() {
    const popped_value = this.peek();
    const bottom = this.size - 1;
    if (bottom > 0) {
      this._swap(0, bottom);
    }
    this._heap.pop();
    this._sift_down();
    return popped_value;
  }
  /**
   * Replace the element with the highest priority in the queue with a new value.
   * @param value The new value.
   * @returns The replaced value.
   */
  replace(value) {
    const replaced_value = this.peek();
    this._heap[0] = value;
    this._sift_down();
    return replaced_value;
  }
  /**
   * Compute the index for the parent of the node at index `i`.
   * @param i The index of the node to get the parent of.
   * @returns The index of the parent node.
   * @private
   */
  _parent(i) {
    return (i + 1 >>> 1) - 1;
  }
  /**
   * Compute the index for the left child of the node at index `i`.
   * @param i The index of the node to get the left child of.
   * @returns The index of the left child.
   * @private
   */
  _left(i) {
    return (i << 1) + 1;
  }
  /**
   * Compute the index for the right child of the node at index `i`.
   * @param i The index of the node to get the right child of.
   * @returns The index of the right child.
   * @private
   */
  _right(i) {
    return i + 1 << 1;
  }
  /**
   * Check if the element at index `i` is greater than the element at index `j`.
   * @param i The index of the first element to compare.
   * @param j The index of the second element to compare.
   * @returns `true` if the element at index `i` is greater than the element at index `j`, `false` otherwise.
   * @private
   */
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  /**
   * Swap the elements at indices `i` and `j`.
   * @param i The index of the first element to swap.
   * @param j The index of the second element to swap.
   * @private
   */
  _swap(i, j) {
    const temp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = temp;
  }
  /**
   * Maintain the heap property by updating positions in the heap,
   * starting at the last element and moving up the heap.
   * @private
   */
  _sift_up() {
    this._sift_up_from(this.size - 1);
  }
  /**
   * Helper function to sift up from a given node.
   * @param node The index of the node to start sifting up from.
   */
  _sift_up_from(node) {
    while (node > 0 && this._greater(node, this._parent(node))) {
      this._swap(node, this._parent(node));
      node = this._parent(node);
    }
  }
  /**
   * Maintain the heap property by updating positions in the heap,
   * starting at the first element and moving down the heap.
   * @private
   */
  _sift_down() {
    let node = 0;
    while (this._left(node) < this.size && this._greater(this._left(node), node) || this._right(node) < this.size && this._greater(this._right(node), node)) {
      const max_child = this._right(node) < this.size && this._greater(this._right(node), this._left(node)) ? this._right(node) : this._left(node);
      this._swap(node, max_child);
      node = max_child;
    }
  }
  /**
   * Get the index of the smallest element in the heap. Since we use an array-based heap,
   * the index can be computed without needing to traverse the heap.
   * @private
   */
  _smallest() {
    return 2 ** Math.floor(Math.log2(this.size)) - 1;
  }
};
var PriorityQueue_default = PriorityQueue;
var LRUCache = class {
  /**
   * Creates an LRUCache instance.
   * @param capacity The maximum number of items the cache can hold.
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Retrieves the value associated with the given key and marks the key as recently used.
   * @param key The key to retrieve.
   * @returns The value associated with the key, or undefined if the key does not exist.
   */
  get(key) {
    if (!this.cache.has(key)) return void 0;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  /**
   * Inserts or updates the key-value pair in the cache.
   * If the key already exists, it is updated and marked as recently used.
   * If the cache exceeds its capacity, the least recently used item is evicted.
   * @param key The key to add or update.
   * @param value The value to associate with the key.
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
  }
};
var LRUCache_default = LRUCache;
var BPE = class extends TokenizerModel_default {
  /**
   * Create a BPE instance.
   * @param config The configuration object for BPE.
   */
  constructor(config) {
    super(config);
    this.tokens_to_ids = object_to_map(config.vocab);
    this.unk_token_id = this.tokens_to_ids.get(config.unk_token);
    this.unk_token = config.unk_token;
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
    const use_new_merge_format = Array.isArray(config.merges[0]);
    this.merges = use_new_merge_format ? config.merges : config.merges.map(
      (x) => x.split(" ", 2)
    );
    this.bpe_ranks = new Map(this.merges.map((x, i) => [JSON.stringify(x), i]));
    this.end_of_word_suffix = config.end_of_word_suffix;
    this.continuing_subword_suffix = config.continuing_subword_suffix ?? null;
    this.byte_fallback = this.config.byte_fallback ?? false;
    if (this.byte_fallback) {
      this.text_encoder = new TextEncoder();
    }
    this.ignore_merges = this.config.ignore_merges ?? false;
    this.max_length_to_cache = 256;
    this.cache_capacity = 1e4;
    this.cache = new LRUCache_default(this.cache_capacity);
  }
  /**
   * Clears the cache.
   */
  clear_cache() {
    this.cache.clear();
  }
  /**
   * Apply Byte-Pair-Encoding (BPE) to a given token. Efficient heap-based priority
   * queue implementation adapted from https://github.com/belladoreai/llama-tokenizer-js.
   * @param token The token to encode.
   * @returns The BPE encoded tokens.
   */
  bpe(token) {
    if (token.length === 0) {
      return [];
    }
    const cached = this.cache.get(token);
    if (cached !== void 0) {
      return cached;
    }
    const word = Array.from(token);
    if (this.end_of_word_suffix) {
      word[word.length - 1] += this.end_of_word_suffix;
    }
    let result = [];
    if (word.length > 1) {
      const queue = new PriorityQueue_default((a, b) => a.score < b.score);
      let starting_node = {
        token: word[0],
        bias: 0,
        prev: null,
        next: null
      };
      let previous_node = starting_node;
      for (let i = 1; i < word.length; ++i) {
        const current_node = {
          bias: i / word.length,
          // Add fractional component to break ties
          token: word[i],
          prev: previous_node,
          next: null
        };
        previous_node.next = current_node;
        this.add_node(queue, previous_node);
        previous_node = current_node;
      }
      while (!queue.is_empty()) {
        const node = queue.pop();
        if (node.deleted || !node.next || node.next.deleted) continue;
        node.deleted = true;
        node.next.deleted = true;
        if (node.prev) {
          const new_previous_node = { ...node.prev };
          node.prev.deleted = true;
          node.prev = new_previous_node;
          if (new_previous_node.prev) {
            new_previous_node.prev.next = new_previous_node;
          } else {
            starting_node = new_previous_node;
          }
        }
        const merged = {
          token: node.token + node.next.token,
          bias: node.bias,
          prev: node.prev,
          next: node.next.next
        };
        if (merged.prev) {
          merged.prev.next = merged;
          this.add_node(queue, merged.prev);
        } else {
          starting_node = merged;
        }
        if (merged.next) {
          merged.next.prev = merged;
          this.add_node(queue, merged);
        }
      }
      for (let current_node = starting_node; current_node !== null; current_node = current_node.next) {
        result.push(current_node.token);
      }
    } else {
      result = word;
    }
    if (this.continuing_subword_suffix) {
      for (let i = 0; i < result.length - 1; ++i) {
        result[i] += this.continuing_subword_suffix;
      }
    }
    if (token.length < this.max_length_to_cache) {
      this.cache.put(token, result);
    }
    return result;
  }
  /**
   * Helper function to add a node to the priority queue.
   * @param queue
   * @param node
   */
  add_node(queue, node) {
    const rank = this.bpe_ranks.get(
      JSON.stringify([node.token, node.next.token])
    );
    if (rank !== void 0) {
      node.score = rank + node.bias;
      queue.push(node);
    }
  }
  /**
   * Encodes the input sequence of tokens using the BPE algorithm and returns the resulting subword tokens.
   * @param tokens The input sequence of tokens to encode.
   * @returns The resulting subword tokens after applying the BPE algorithm to the input sequence of tokens.
   */
  encode(tokens) {
    const output_tokens = [];
    for (const token of tokens) {
      if (this.ignore_merges && this.tokens_to_ids.has(token)) {
        output_tokens.push(token);
        continue;
      }
      const bpe_token_list = this.bpe(token);
      for (const t of bpe_token_list) {
        if (this.tokens_to_ids.has(t)) {
          output_tokens.push(t);
        } else if (this.byte_fallback) {
          const byte_tokens = Array.from(this.text_encoder.encode(t)).map(
            (x) => `<0x${x.toString(16).toUpperCase().padStart(2, "0")}>`
          );
          if (byte_tokens.every((x) => this.tokens_to_ids.has(x))) {
            output_tokens.push(...byte_tokens);
          } else if (this.unk_token != null) {
            output_tokens.push(this.unk_token);
          }
        } else if (this.unk_token != null) {
          output_tokens.push(this.unk_token);
        }
      }
    }
    return output_tokens;
  }
};
var BPE_default = BPE;
var Legacy = class extends TokenizerModel_default {
  /**
   * Create a Legacy tokenizer model instance.
   * @param config The configuration object for Legacy tokenizer model.
   * @param more_config Additional configuration object for the Legacy tokenizer model.
   */
  constructor(config, more_config) {
    super(config);
    const vocab = config.vocab;
    this.tokens_to_ids = object_to_map(
      more_config.target_lang ? vocab[more_config.target_lang] : vocab
    );
    this.bos_token = more_config.bos_token;
    this.bos_token_id = this.tokens_to_ids.get(this.bos_token);
    this.eos_token = more_config.eos_token;
    this.eos_token_id = this.tokens_to_ids.get(this.eos_token);
    this.pad_token = more_config.pad_token;
    this.pad_token_id = this.tokens_to_ids.get(this.pad_token);
    this.unk_token = more_config.unk_token;
    this.unk_token_id = this.tokens_to_ids.get(this.unk_token);
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
  }
  encode(tokens) {
    return tokens;
  }
};
var Legacy_default = Legacy;
function create_tokenizer_model(model_config, config) {
  switch (model_config.type) {
    case "WordPiece":
      return new WordPiece_default(model_config);
    case "Unigram":
      return new Unigram_default(model_config, config.eos_token);
    case "BPE":
      return new BPE_default(model_config);
    default:
      if (model_config.vocab) {
        if (Array.isArray(model_config.vocab)) {
          return new Unigram_default(model_config, config.eos_token);
        } else if (Object.hasOwn(model_config, "continuing_subword_prefix") && Object.hasOwn(model_config, "unk_token")) {
          if (Object.hasOwn(model_config, "merges")) {
            return new BPE_default(model_config);
          } else {
            return new WordPiece_default(model_config);
          }
        } else {
          return new Legacy_default(model_config, {
            target_lang: config.target_lang,
            bos_token: config.bos_token,
            eos_token: config.eos_token,
            pad_token: config.pad_token,
            unk_token: config.unk_token
          });
        }
      }
      throw new Error(
        `Unknown TokenizerModel type: ${model_config?.type}`
      );
  }
}
var create_tokenizer_model_default = create_tokenizer_model;
var PostProcessor = class extends Callable_default {
  /**
   * @param config The configuration for the post-processor.
   */
  constructor(config) {
    super();
    this.config = config;
  }
  /**
   * Alias for {@link PostProcessor#post_process}.
   * @param tokens The text or array of texts to post-process.
   * @param args Additional arguments required by the post-processing logic.
   * @returns The post-processed tokens.
   */
  _call(tokens, ...args) {
    return this.post_process(tokens, ...args);
  }
};
var PostProcessor_default = PostProcessor;
var TemplateProcessing = class extends PostProcessor_default {
  /**
   * Replaces special tokens in the template with actual tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns An object containing the list of tokens with the special tokens replaced with actual tokens.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    const type = tokens_pair === null ? this.config.single : this.config.pair;
    let processed_tokens = [];
    let types = [];
    for (const item of type) {
      if ("SpecialToken" in item) {
        if (add_special_tokens) {
          processed_tokens.push(item.SpecialToken.id);
          types.push(item.SpecialToken.type_id);
        }
      } else if ("Sequence" in item) {
        if (item.Sequence.id === "A") {
          processed_tokens = merge_arrays(processed_tokens, tokens);
          types = merge_arrays(
            types,
            new Array(tokens.length).fill(item.Sequence.type_id)
          );
        } else if (item.Sequence.id === "B") {
          processed_tokens = merge_arrays(processed_tokens, tokens_pair);
          types = merge_arrays(
            types,
            new Array(tokens_pair.length).fill(item.Sequence.type_id)
          );
        }
      }
    }
    return { tokens: processed_tokens, token_type_ids: types };
  }
};
var TemplateProcessing_default = TemplateProcessing;
var ByteLevel2 = class extends PostProcessor_default {
  /**
   * Post process the given tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @returns An object containing the post-processed tokens.
   */
  post_process(tokens, tokens_pair = null) {
    return { tokens, tokens_pair };
  }
};
var ByteLevel_default2 = ByteLevel2;
var BertProcessing = class extends PostProcessor_default {
  /**
   * @param config The configuration for the post-processor.
   * @param config.cls The special tokens to add to the beginning of the input.
   * @param config.sep The special tokens to add to the end of the input.
   */
  constructor(config) {
    super(config);
    this.sep = config.sep;
    this.cls = config.cls;
  }
  /**
   * Adds the special tokens to the beginning and end of the input.
   * @param tokens The input tokens.
   * @param tokens_pair An optional second set of input tokens.
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns The post-processed tokens with the special tokens added to the beginning and end.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    if (add_special_tokens) {
      tokens = merge_arrays([this.cls[0]], tokens, [this.sep[0]]);
    }
    let token_type_ids = new Array(tokens.length).fill(0);
    if (tokens_pair) {
      const middle = [];
      const after = add_special_tokens ? [this.sep[0]] : [];
      tokens = merge_arrays(tokens, middle, tokens_pair, after);
      token_type_ids = merge_arrays(
        token_type_ids,
        new Array(tokens_pair.length + middle.length + after.length).fill(1)
      );
    }
    return { tokens, token_type_ids };
  }
};
var BertProcessing_default = BertProcessing;
var RobertaProcessing = class extends PostProcessor_default {
  /**
   * @param config The configuration for the post-processor.
   * @param config.cls The special tokens to add to the beginning of the input.
   * @param config.sep The special tokens to add to the end of the input.
   */
  constructor(config) {
    super(config);
    this.sep = config.sep;
    this.cls = config.cls;
  }
  /**
   * Adds the special tokens to the beginning and end of the input.
   * @param tokens The input tokens.
   * @param tokens_pair An optional second set of input tokens.
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns The post-processed tokens with the special tokens added to the beginning and end.
   */
  post_process(tokens, tokens_pair, add_special_tokens = true) {
    if (add_special_tokens) {
      tokens = merge_arrays([this.cls[0]], tokens, [this.sep[0]]);
    }
    let token_type_ids = new Array(tokens.length).fill(0);
    if (tokens_pair) {
      const middle = add_special_tokens ? [this.sep[0]] : [];
      const after = add_special_tokens ? [this.sep[0]] : [];
      tokens = merge_arrays(tokens, middle, tokens_pair, after);
      token_type_ids = merge_arrays(
        token_type_ids,
        new Array(tokens_pair.length + middle.length + after.length).fill(1)
      );
    }
    return { tokens, token_type_ids };
  }
};
var RobertaProcessing_default = RobertaProcessing;
var Sequence3 = class extends PostProcessor_default {
  /**
   * Creates a new instance of Sequence post-processor.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.processors = (config.processors ?? []).map((x) => create_post_processor_default(x));
  }
  /**
   * Post process the given tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns An object containing the post-processed tokens.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    let processed_tokens = { tokens, tokens_pair };
    for (const processor of this.processors) {
      processed_tokens = processor.post_process(
        processed_tokens.tokens,
        processed_tokens.tokens_pair,
        add_special_tokens
      );
    }
    return processed_tokens;
  }
};
var Sequence_default3 = Sequence3;
function create_post_processor(config) {
  if (config === null) return null;
  switch (config.type) {
    case "TemplateProcessing":
      return new TemplateProcessing_default(config);
    case "ByteLevel":
      return new ByteLevel_default2(config);
    case "BertProcessing":
      return new BertProcessing_default(config);
    case "RobertaProcessing":
      return new RobertaProcessing_default(config);
    case "Sequence":
      return new Sequence_default3(config);
    default:
      throw new Error(`Unknown PostProcessor type: ${config.type}`);
  }
}
var create_post_processor_default = create_post_processor;
var Decoder = class extends Callable_default {
  /**
   * Creates an instance of `Decoder`.
   * @param config The configuration object.
   **/
  constructor(config) {
    super();
    this.config = config;
    this.added_tokens = [];
    this.end_of_word_suffix = null;
    this.trim_offsets = "trim_offsets" in config ? config.trim_offsets : false;
  }
  /**
   * Calls the `decode` method.
   *
   * @param tokens The list of tokens.
   * @returns The decoded string.
   */
  _call(tokens) {
    return this.decode(tokens);
  }
  /**
   * Decodes a list of tokens.
   * @param tokens The list of tokens.
   * @returns The decoded string.
   */
  decode(tokens) {
    return this.decode_chain(tokens).join("");
  }
};
var Decoder_default = Decoder;
var ByteLevel3 = class extends Decoder_default {
  /**
   * Create a `ByteLevelDecoder` object.
   */
  constructor(config) {
    super(config);
    this.byte_decoder = UNICODE_TO_BYTES;
    this.text_decoder = new TextDecoder("utf-8", {
      fatal: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ignoreBOM: true
    });
    this.end_of_word_suffix = null;
  }
  /**
   * Convert an array of tokens to string by decoding each byte.
   * @param tokens Array of tokens to be decoded.
   * @returns The decoded string.
   */
  convert_tokens_to_string(tokens) {
    const text = tokens.join("");
    const byte_array = new Uint8Array(
      [...text].map((c) => this.byte_decoder[c])
    );
    return this.text_decoder.decode(byte_array);
  }
  decode_chain(tokens) {
    const sub_texts = [];
    let current_sub_text = [];
    for (const token of tokens) {
      if (this.added_tokens.find((x) => x.content === token) !== void 0) {
        if (current_sub_text.length > 0) {
          sub_texts.push(this.convert_tokens_to_string(current_sub_text));
          current_sub_text = [];
        }
        sub_texts.push(token);
      } else {
        current_sub_text.push(token);
      }
    }
    if (current_sub_text.length > 0) {
      sub_texts.push(this.convert_tokens_to_string(current_sub_text));
    }
    return sub_texts;
  }
};
var ByteLevel_default3 = ByteLevel3;
var WordPiece = class extends Decoder_default {
  /**
   * Creates a new instance of WordPieceDecoder.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.cleanup = config.cleanup;
  }
  decode_chain(tokens) {
    return tokens.map((token, i) => {
      if (i !== 0) {
        const prefix = this.config.prefix;
        if (prefix && token.startsWith(prefix)) {
          token = token.replace(prefix, "");
        } else {
          token = " " + token;
        }
      }
      if (this.cleanup) {
        token = clean_up_tokenization(token);
      }
      return token;
    });
  }
};
var WordPiece_default2 = WordPiece;
var Metaspace2 = class extends Decoder_default {
  /**
   * Constructs a new MetaspaceDecoder object.
   * @param config The configuration object for the MetaspaceDecoder.
   */
  constructor(config) {
    super(config);
    this.replacement = config.replacement ?? "\u2581";
  }
  decode_chain(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; ++i) {
      let normalized = tokens[i].replaceAll(this.replacement, " ");
      if (i == 0 && normalized.startsWith(" ")) {
        normalized = normalized.substring(1);
      }
      result.push(normalized);
    }
    return result;
  }
};
var Metaspace_default2 = Metaspace2;
var BPE2 = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.suffix = config.suffix ?? "";
  }
  decode_chain(tokens) {
    return tokens.map((token, i) => {
      return token.replaceAll(this.suffix, i === tokens.length - 1 ? "" : " ");
    });
  }
};
var BPE_default2 = BPE2;
var CTC = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.pad_token = config.pad_token ?? "";
    this.word_delimiter_token = config.word_delimiter_token ?? "";
    this.cleanup = config.cleanup;
  }
  /**
   * Converts a connectionist-temporal-classification (CTC) output tokens into a single string.
   * @param tokens Array of tokens to be decoded.
   * @returns The decoded string.
   */
  convert_tokens_to_string(tokens) {
    if (tokens.length === 0) return "";
    const grouped_tokens = [tokens[0]];
    for (let i = 1; i < tokens.length; ++i) {
      if (tokens[i] !== grouped_tokens.at(-1)) {
        grouped_tokens.push(tokens[i]);
      }
    }
    const filtered_tokens = grouped_tokens.filter(
      (token) => token !== this.pad_token
    );
    let text = filtered_tokens.join("");
    if (this.cleanup) {
      text = clean_up_tokenization(text).replaceAll(this.word_delimiter_token, " ").trim();
    }
    return text;
  }
  decode_chain(tokens) {
    return [this.convert_tokens_to_string(tokens)];
  }
};
var CTC_default = CTC;
var Sequence4 = class extends Decoder_default {
  /**
   * Creates a new instance of DecoderSequence.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.decoders = (config.decoders ?? []).map((x) => create_decoder_default(x));
  }
  decode_chain(tokens) {
    return this.decoders.reduce((toks, decoder3) => {
      return decoder3.decode_chain(toks);
    }, tokens);
  }
};
var Sequence_default4 = Sequence4;
var Replace3 = class extends Decoder_default {
  /**
   * @param config The configuration object for the decoder.
   */
  constructor(config) {
    super(config);
    this.pattern = create_pattern(this.config.pattern);
  }
  decode_chain(tokens) {
    const content = this.config.content ?? "";
    const pattern = this.pattern;
    return pattern === null ? tokens : tokens.map((token) => token.replaceAll(pattern, content));
  }
};
var Replace_default3 = Replace3;
var Fuse = class extends Decoder_default {
  decode_chain(tokens) {
    return [tokens.join("")];
  }
};
var Fuse_default = Fuse;
var Strip2 = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.content = config.content ?? "";
    this.start = config.start ?? 0;
    this.stop = config.stop ?? 0;
  }
  decode_chain(tokens) {
    return tokens.map((token) => {
      let start_cut = 0;
      for (let i = 0; i < this.start; ++i) {
        if (token[i] === this.content) {
          start_cut = i + 1;
          continue;
        } else {
          break;
        }
      }
      let stop_cut = token.length;
      for (let i = 0; i < this.stop; ++i) {
        const index = token.length - i - 1;
        if (token[index] === this.content) {
          stop_cut = index;
          continue;
        } else {
          break;
        }
      }
      return token.slice(start_cut, stop_cut);
    });
  }
};
var Strip_default2 = Strip2;
var ByteFallback = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.text_decoder = new TextDecoder();
  }
  decode_chain(tokens) {
    const new_tokens = [];
    let previous_byte_tokens = [];
    for (const token of tokens) {
      let bytes = null;
      if (token.length === 6 && token.startsWith("<0x") && token.endsWith(">")) {
        const byte = parseInt(token.slice(3, 5), 16);
        if (!isNaN(byte)) {
          bytes = byte;
        }
      }
      if (bytes !== null) {
        previous_byte_tokens.push(bytes);
      } else {
        if (previous_byte_tokens.length > 0) {
          const string = this.text_decoder.decode(
            Uint8Array.from(previous_byte_tokens)
          );
          new_tokens.push(string);
          previous_byte_tokens = [];
        }
        new_tokens.push(token);
      }
    }
    if (previous_byte_tokens.length > 0) {
      const string = this.text_decoder.decode(
        Uint8Array.from(previous_byte_tokens)
      );
      new_tokens.push(string);
      previous_byte_tokens = [];
    }
    return new_tokens;
  }
};
var ByteFallback_default = ByteFallback;
function create_decoder(config) {
  if (config === null) return null;
  switch (config.type) {
    case "ByteLevel":
      return new ByteLevel_default3(config);
    case "WordPiece":
      return new WordPiece_default2(config);
    case "Metaspace":
      return new Metaspace_default2(config);
    case "BPEDecoder":
      return new BPE_default2(config);
    case "CTC":
      return new CTC_default(config);
    case "Sequence":
      return new Sequence_default4(config);
    case "Replace":
      return new Replace_default3(config);
    case "Fuse":
      return new Fuse_default(config);
    case "Strip":
      return new Strip_default2(config);
    case "ByteFallback":
      return new ByteFallback_default(config);
    default:
      throw new Error(`Unknown Decoder type: ${config.type}`);
  }
}
var create_decoder_default = create_decoder;
var Tokenizer = class {
  constructor(tokenizer2, config) {
    const tokenizer_error = validate_object(tokenizer2, "Tokenizer", [
      "model",
      "decoder",
      "post_processor",
      "pre_tokenizer",
      "normalizer"
    ]);
    if (tokenizer_error) {
      throw new Error(tokenizer_error);
    }
    const config_error = validate_object(config, "Config");
    if (config_error) {
      throw new Error(config_error);
    }
    this.tokenizer = tokenizer2;
    this.config = config;
    this.normalizer = create_normalizer_default(this.tokenizer.normalizer);
    this.pre_tokenizer = create_pre_tokenizer_default(this.tokenizer.pre_tokenizer);
    this.model = create_tokenizer_model_default(this.tokenizer.model, this.config);
    this.post_processor = create_post_processor_default(this.tokenizer.post_processor);
    this.decoder = create_decoder_default(this.tokenizer.decoder);
    this.special_tokens = [];
    this.all_special_ids = [];
    this.added_tokens = [];
    const unnormalized_contents = [];
    const normalized_contents = [];
    this.added_tokens_map = /* @__PURE__ */ new Map();
    for (const added_token of this.tokenizer.added_tokens) {
      const token = new AddedToken_default(added_token);
      this.added_tokens.push(token);
      this.model.tokens_to_ids.set(token.content, token.id);
      this.model.vocab[token.id] = token.content;
      if (token.special) {
        this.special_tokens.push(token.content);
        this.all_special_ids.push(token.id);
      }
      this.added_tokens_map.set(token.content, token);
      if (token.normalized && this.normalizer !== null) {
        const normalized_content = this.normalizer(token.content);
        normalized_contents.push(normalized_content);
        this.added_tokens_map.set(normalized_content, token);
      } else {
        unnormalized_contents.push(token.content);
      }
    }
    (this.config.additional_special_tokens ?? []).forEach((token) => {
      if (!this.special_tokens.includes(token)) this.special_tokens.push(token);
    });
    if (this.decoder) {
      this.decoder.added_tokens = this.added_tokens;
      this.decoder.end_of_word_suffix = this.model.end_of_word_suffix;
    }
    this.splitter_unnormalized = new DictionarySplitter_default(unnormalized_contents);
    this.splitter_normalized = new DictionarySplitter_default(normalized_contents);
    this.remove_space = this.config.remove_space;
    this.clean_up_tokenization_spaces = this.config.clean_up_tokenization_spaces ?? true;
    this.do_lowercase_and_remove_accent = this.config.do_lowercase_and_remove_accent ?? false;
  }
  // Implementation
  encode(text, {
    text_pair = null,
    add_special_tokens = true,
    return_token_type_ids = null
  } = {}) {
    const { tokens, token_type_ids } = this.tokenize_helper(text, {
      text_pair,
      add_special_tokens
    });
    const input_ids = tokens.map(
      (t) => this.added_tokens_map.get(t)?.id ?? this.model.tokens_to_ids.get(t) ?? this.model.unk_token_id
    );
    const result = {
      ids: input_ids,
      tokens,
      attention_mask: new Array(input_ids.length).fill(1)
    };
    if (return_token_type_ids && token_type_ids) {
      result.token_type_ids = token_type_ids;
    }
    return result;
  }
  decode(token_ids, options = {}) {
    if (!Array.isArray(token_ids) || token_ids.length === 0 || !is_integral_number(token_ids[0])) {
      throw Error("token_ids must be a non-empty array of integers.");
    }
    let tokens = token_ids.map(
      (i) => this.model.vocab[Number(i)] ?? this.model.unk_token
    );
    if (options.skip_special_tokens) {
      tokens = tokens.filter((x) => !this.special_tokens.includes(x));
    }
    let decoded = this.decoder ? this.decoder(tokens) : tokens.join(" ");
    if (this.decoder && this.decoder.end_of_word_suffix) {
      decoded = decoded.replaceAll(this.decoder.end_of_word_suffix, " ");
      if (options.skip_special_tokens) {
        decoded = decoded.trim();
      }
    }
    if (options.clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) {
      decoded = clean_up_tokenization(decoded);
    }
    return decoded;
  }
  /**
   * Converts a string into a sequence of tokens.
   * @param text The sequence to be encoded.
   * @param options An optional object containing the following properties:
   * @returns The list of tokens.
   */
  tokenize(text, { text_pair = null, add_special_tokens = false } = {}) {
    return this.tokenize_helper(text, { text_pair, add_special_tokens }).tokens;
  }
  encode_text(text) {
    if (text === null) {
      return null;
    }
    const sections = this.splitter_unnormalized.split(text);
    sections.forEach((section, i) => {
      const added_token = this.added_tokens_map.get(section);
      if (added_token) {
        if (added_token.lstrip && i > 0) {
          sections[i - 1] = sections[i - 1].trimEnd();
        }
        if (added_token.rstrip && i < sections.length - 1) {
          sections[i + 1] = sections[i + 1].trimStart();
        }
      }
    });
    return sections.flatMap((processed_text, section_index) => {
      if (processed_text.length === 0) {
        return [];
      }
      if (this.added_tokens_map.has(processed_text)) {
        return [processed_text];
      }
      if (this.remove_space === true) {
        processed_text = processed_text.trim().split(/\s+/).join(" ");
      }
      if (this.do_lowercase_and_remove_accent) {
        processed_text = lowercase_and_remove_accents(processed_text);
      }
      if (this.normalizer !== null) {
        processed_text = this.normalizer(processed_text);
      }
      if (processed_text.length === 0) {
        return [];
      }
      const subsections = this.splitter_normalized.split(processed_text);
      subsections.forEach((subsection, j) => {
        const added_token = this.added_tokens_map.get(subsection);
        if (added_token) {
          if (added_token.lstrip && j > 0) {
            subsections[j - 1] = subsections[j - 1].trimEnd();
          }
          if (added_token.rstrip && j < subsections.length - 1) {
            subsections[j + 1] = subsections[j + 1].trimStart();
          }
        }
      });
      return subsections.flatMap((subsection) => {
        if (subsection.length === 0) {
          return [];
        }
        if (this.added_tokens_map.has(subsection)) {
          return [subsection];
        }
        const section_tokens = this.pre_tokenizer !== null ? this.pre_tokenizer(subsection, {
          section_index
        }) : [subsection];
        return this.model(section_tokens);
      });
    });
  }
  tokenize_helper(text, { text_pair = null, add_special_tokens = true }) {
    const tokens1 = this.encode_text(text);
    const tokens2 = this.encode_text(text_pair || null);
    return this.post_processor ? this.post_processor(tokens1, tokens2, add_special_tokens) : { tokens: merge_arrays(tokens1 ?? [], tokens2 ?? []) };
  }
  /**
   * Converts a token string to its corresponding token ID.
   * @param token The token string to convert.
   * @returns The token ID, or undefined if the token is not in the vocabulary.
   */
  token_to_id(token) {
    return this.model.tokens_to_ids.get(token);
  }
  /**
   * Converts a token ID to its corresponding token string.
   * @param id The token ID to convert.
   * @returns The token string, or undefined if the ID is not in the vocabulary.
   */
  id_to_token(id) {
    return this.model.vocab[id];
  }
  /**
   * Returns a mapping of token IDs to AddedToken objects for all added tokens.
   * @returns A Map where keys are token IDs and values are AddedToken objects.
   */
  get_added_tokens_decoder() {
    const decoder3 = /* @__PURE__ */ new Map();
    for (const token of this.added_tokens) {
      decoder3.set(token.id, token);
    }
    return decoder3;
  }
  /**
   * Get the underlying vocabulary
   * @param with_added_tokens Whether to include the added tokens
   * @returns The vocabulary
   */
  get_vocab(with_added_tokens = true) {
    const vocab = /* @__PURE__ */ new Map();
    for (let i = 0; i < this.model.vocab.length; ++i) {
      const token = this.model.vocab[i];
      if (with_added_tokens || !this.added_tokens_map.has(token)) {
        vocab.set(token, i);
      }
    }
    return vocab;
  }
};
var Tokenizer_default = Tokenizer;

// src/sampling.js
function sample(logits, temperature, uniform) {
  if (!logits.length) throw new Error("Cannot sample empty logits.");
  if (!Number.isFinite(temperature) || temperature < 0) throw new Error("Invalid sampling temperature.");
  let best = 0;
  for (let i = 1; i < logits.length; i += 1) if (logits[i] > logits[best]) best = i;
  if (temperature === 0) return best;
  if (!Number.isFinite(uniform) || uniform < 0 || uniform >= 1) {
    throw new Error("A sampling draw must be finite and in [0, 1).");
  }
  const probabilities = new Float64Array(logits.length);
  let total = 0;
  for (let i = 0; i < logits.length; i += 1) {
    probabilities[i] = Math.exp((logits[i] - logits[best]) / temperature);
    total += probabilities[i];
  }
  if (!Number.isFinite(total) || total <= 0) throw new Error("The model returned invalid sampling logits.");
  let draw = uniform * total;
  for (let i = 0; i < probabilities.length; i += 1) {
    draw -= probabilities[i];
    if (draw < 0) return i;
  }
  return best;
}

// src/memory-tokens.js
var WHITESPACE = /* @__PURE__ */ new Set([32, 9, 10, 13, 11, 12, 28, 29, 30, 31]);
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function byteAlphabet() {
  const bytes = [];
  for (let b = 33; b <= 126; b += 1) bytes.push(b);
  for (let b = 161; b <= 172; b += 1) bytes.push(b);
  for (let b = 174; b <= 255; b += 1) bytes.push(b);
  const chars = bytes.map((b) => String.fromCodePoint(b));
  let extra = 0;
  for (let b = 0; b < 256; b += 1) {
    if (!bytes.includes(b)) {
      bytes.push(b);
      chars.push(String.fromCodePoint(256 + extra));
      extra += 1;
    }
  }
  return new Map(chars.map((c, i) => [c, bytes[i]]));
}
function tokenTable(tokenizerJson) {
  const alphabet = byteAlphabet();
  const special = new Set(tokenizerJson.added_tokens.filter((t) => t.special).map((t) => t.id));
  const size = Math.max(...Object.values(tokenizerJson.model.vocab), ...tokenizerJson.added_tokens.map((t) => t.id)) + 1;
  const bytes = Array.from({ length: size }, () => new Uint8Array(0));
  const single = new Int32Array(256).fill(-1);
  for (const [token, id] of Object.entries(tokenizerJson.model.vocab)) {
    if (special.has(id)) continue;
    bytes[id] = Uint8Array.from(Array.from(token, (c) => alphabet.get(c)));
    if (bytes[id].length === 1) single[bytes[id][0]] = id;
  }
  return { bytes, single };
}
function memoryPrompt(spec, achievements, memory) {
  const done = new Set(achievements);
  const chosen = spec.achievements.filter(([name]) => done.has(name));
  const ach = chosen.length ? chosen.flatMap(([, first, later], i) => i === 0 ? first : later) : spec.none;
  const build = (tokens) => [...spec.prefix, ...ach, ...spec.middle, ...tokens.length ? tokens : spec.empty, ...spec.suffix];
  const ids = build(memory);
  return ids.length > spec.width && memory.length ? build([]) : ids;
}
function find(text, pattern, from) {
  outer: for (let i = Math.max(0, from); i + pattern.length <= text.length; i += 1) {
    for (let j = 0; j < pattern.length; j += 1) if (text[i + j] !== pattern[j]) continue outer;
    return i;
  }
  return -1;
}
function readAnswer(tokens, table2, actions, chars = 300) {
  const parts = tokens.map((t) => table2.bytes[t] || new Uint8Array(0));
  const starts = [];
  let total = 0;
  for (const part of parts) {
    starts.push(total);
    total += part.length;
  }
  const text = new Uint8Array(total);
  parts.forEach((part, i) => text.set(part, starts[i]));
  const [open, close, memoryOpen, memoryClose] = ["<action>", "</action>", "<memory>", "</memory>"].map((s) => encoder.encode(s));
  const names = new Map(actions.map((name) => [name, name]));
  let action = null;
  let after = -1;
  for (let at2 = find(text, open, 0); at2 >= 0; at2 = find(text, open, at2 + 1)) {
    const end = find(text, close, at2 + open.length);
    if (end < 0) break;
    let a = at2 + open.length;
    let b = end;
    while (a < b && WHITESPACE.has(text[a])) a += 1;
    while (b > a && WHITESPACE.has(text[b - 1])) b -= 1;
    const name = decoder.decode(text.subarray(a, b));
    if (names.has(name)) {
      action = name;
      after = end + close.length;
      break;
    }
  }
  if (action === null) return null;
  const blockOpen = find(text, memoryOpen, after);
  if (blockOpen < 0) return null;
  const blockClose = find(text, memoryClose, blockOpen + memoryOpen.length);
  if (blockClose < 0) return null;
  let low = blockOpen + memoryOpen.length;
  let high = blockClose;
  while (low < high && WHITESPACE.has(text[low])) low += 1;
  while (high > low && WHITESPACE.has(text[high - 1])) high -= 1;
  let count = 0;
  for (let i = low; i < high; i += 1) {
    if ((text[i] & 192) !== 128) {
      count += 1;
      if (count > chars) {
        high = i;
        break;
      }
    }
  }
  const memory = [];
  tokens.forEach((token, i) => {
    const s = starts[i];
    const e = s + parts[i].length;
    if (s >= low && e <= high && e > s) memory.push(token);
    else if (s < high && e > low) {
      for (let b = Math.max(s, low); b < Math.min(e, high); b += 1) if (table2.single[text[b]] >= 0) memory.push(table2.single[text[b]]);
    }
  });
  return { action, memory, memoryText: decoder.decode(text.subarray(low, high)) };
}

// src/vision-worker.js
var vision;
var decoder2;
var tokenizer;
var manifest;
var table = null;
var activeId = null;
var cancelled = false;
var loading = false;
var threads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
var siteRoot = new URL("../", import.meta.url);
var modelRoot = new URL("assets/models/vision-memory/", siteRoot);
I.wasm.wasmPaths = new URL("vendor/ort/", siteRoot).href;
I.wasm.numThreads = threads;
I.wasm.proxy = false;
function status(message) {
  self.postMessage({ type: "status", message });
}
async function readJson(name) {
  const response = await fetch(new URL(name, modelRoot));
  if (!response.ok) throw new Error(`Cannot download ${name} (HTTP ${response.status}).`);
  return response.json();
}
async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
}
async function downloadAll(files) {
  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  const loaded = files.map(() => 0);
  let lastUpdate = 0;
  const report = () => {
    const now = performance.now();
    const sum = loaded.reduce((a, b) => a + b, 0);
    if (now - lastUpdate > 100 || sum === total) {
      self.postMessage({ type: "download", loaded: sum, total });
      lastUpdate = now;
    }
  };
  return Promise.all(files.map(async (file, index) => {
    const url = new URL(file.name, modelRoot);
    url.searchParams.set("sha256", file.sha256);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Model download failed (HTTP ${response.status}).`);
    if (!response.body?.getReader) return response.arrayBuffer();
    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded[index] += value.byteLength;
      report();
    }
    const bytes = new Uint8Array(loaded[index]);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes.buffer;
  }));
}
async function load(directory = "vision-memory") {
  modelRoot = new URL(`assets/models/${directory}/`, siteRoot);
  if (loading || activeId !== null) throw new Error("The model is busy.");
  loading = true;
  try {
    status("Downloading the vision model\u2026");
    const [metadata, tokenizerJson, tokenizerConfig] = await Promise.all([
      readJson("manifest.json"),
      readJson("tokenizer.json"),
      readJson("tokenizer_config.json")
    ]);
    const [visionBytes, decoderBytes] = await downloadAll([
      { name: "vision.onnx", bytes: metadata.vision_bytes, sha256: metadata.vision_sha256 },
      { name: "decoder.onnx", bytes: metadata.decoder_bytes, sha256: metadata.decoder_sha256 }
    ]);
    if (await sha256(visionBytes) !== metadata.vision_sha256 || await sha256(decoderBytes) !== metadata.decoder_sha256) {
      throw new Error("The model download failed its integrity check. Reload the page and try Run again.");
    }
    tokenizer = new Tokenizer_default(tokenizerJson, tokenizerConfig);
    table = tokenTable(tokenizerJson);
    const check = tokenizer.encode(metadata.tokenizer_check.text, { add_special_tokens: false }).ids;
    if (JSON.stringify(check) !== JSON.stringify(metadata.tokenizer_check.ids)) {
      throw new Error("Browser tokenizer differs from the exported student tokenizer.");
    }
    status("Starting ONNX WebAssembly\u2026");
    const options = { executionProviders: ["wasm"], graphOptimizationLevel: "all" };
    vision = await Ln.create(visionBytes, options);
    decoder2 = await Ln.create(decoderBytes, options);
    manifest = metadata;
    self.postMessage({ type: "ready", manifest, threads });
  } finally {
    loading = false;
  }
}
function patchify(rgba, width) {
  const { size: p, merge: m, image } = manifest.patch;
  const grid = image / p;
  const out = new Float32Array(grid * grid * 3 * 2 * p * p);
  let row = 0;
  for (let bh = 0; bh < grid / m; bh += 1) for (let bw = 0; bw < grid / m; bw += 1) {
    for (let mh = 0; mh < m; mh += 1) for (let mw = 0; mw < m; mw += 1) {
      const y0 = (bh * m + mh) * p;
      const x0 = (bw * m + mw) * p;
      let col = row * 3 * 2 * p * p;
      for (let c = 0; c < 3; c += 1) for (let t = 0; t < 2; t += 1) {
        for (let py = 0; py < p; py += 1) for (let px = 0; px < p; px += 1) {
          out[col++] = (rgba[((y0 + py) * width + x0 + px) * 4 + c] / 255 - 0.5) / 0.5;
        }
      }
      row += 1;
    }
  }
  return out;
}
function positions(ids) {
  const start = ids.indexOf(manifest.image_token_id);
  const side = Math.round(Math.sqrt(manifest.vision_tokens));
  const out = [[], [], []];
  for (let i = 0; i < start; i += 1) out.forEach((axis) => axis.push(i));
  for (let h = 0; h < side; h += 1) for (let w = 0; w < side; w += 1) {
    out[0].push(start);
    out[1].push(start + h);
    out[2].push(start + w);
  }
  for (let i = start + manifest.vision_tokens; i < ids.length; i += 1) {
    const value = start + side + (i - start - manifest.vision_tokens);
    out.forEach((axis) => axis.push(value));
  }
  return out;
}
async function generate(message) {
  if (!decoder2 || loading) throw new Error("Model is not ready");
  if (activeId !== null) throw new Error("Another response is still being generated");
  activeId = message.id;
  cancelled = false;
  const started = performance.now();
  const L = manifest.layers;
  const H = manifest.hidden;
  const tensors = [];
  const keep = (t) => {
    tensors.push(t);
    return t;
  };
  let cache = Array.from({ length: 2 * L }, () => new W("float32", new Float32Array(0), [1, manifest.kv_heads, 0, manifest.head_dim]));
  let output;
  try {
    const temperature = Number(message.temperature);
    if (![0, 1].includes(temperature)) throw new Error("Unsupported sampling temperature");
    const cap = Math.max(1, Math.min(Number(message.maxNewTokens), message.samplingDraws?.length ?? 0));
    const pixels = keep(new W("float32", patchify(new Uint8Array(message.frame.rgba), message.frame.width), [256, 1536]));
    const seen = await vision.run({ pixel_values: pixels });
    Object.values(seen).forEach(keep);
    const ids = memoryPrompt(manifest.memory_prompt, message.achievements, message.memoryTokens);
    const S = ids.length;
    const start = ids.indexOf(manifest.image_token_id);
    const mask = new Float32Array(S);
    const embeds = new Float32Array(S * H);
    const deep0 = new Float32Array(S * H);
    const deep1 = new Float32Array(S * H);
    for (let i = 0; i < manifest.vision_tokens; i += 1) mask[start + i] = 1;
    embeds.set(seen.image_embeds.data, start * H);
    deep0.set(seen.deepstack_0.data, start * H);
    deep1.set(seen.deepstack_1.data, start * H);
    const pos = positions(ids);
    let lastPosition = Math.max(...pos.flat());
    async function run(tokens, positionRows, maskRows, embedRows, d0, d1, past) {
      const n = tokens.length;
      const feeds = {
        input_ids: keep(new W("int64", BigInt64Array.from(tokens, BigInt), [1, n])),
        position_ids: keep(new W("int64", BigInt64Array.from(positionRows.flat(), BigInt), [3, 1, n])),
        visual_mask: keep(new W("float32", maskRows, [1, n, 1])),
        visual_embeds: keep(new W("float32", embedRows, [1, n, H])),
        deepstack_0: keep(new W("float32", d0, [1, n, H])),
        deepstack_1: keep(new W("float32", d1, [1, n, H]))
      };
      for (let i = 0; i < L; i += 1) {
        feeds[`past_key_${i}`] = past[2 * i];
        feeds[`past_value_${i}`] = past[2 * i + 1];
      }
      const result = await decoder2.run(feeds);
      const present = [];
      for (let i = 0; i < L; i += 1) present.push(result[`present_key_${i}`], result[`present_value_${i}`]);
      return { logits: result.logits, cache: present };
    }
    async function forward(tokens, positionRows, maskRows, embedRows, d0, d1) {
      const result = await run(tokens, positionRows, maskRows, embedRows, d0, d1, cache);
      cache.forEach((t) => t.dispose?.());
      cache = result.cache;
      return result.logits;
    }
    async function actionDistribution(names2, rest, first, past, position) {
      const sequences = names2.map((name) => tokenizer.encode(rest + name + "</action>", { add_special_tokens: false }).ids);
      const root = { children: /* @__PURE__ */ new Map(), ends: [] };
      sequences.forEach((tokens, index) => {
        let node = root;
        for (const token of tokens) {
          if (!node.children.has(token)) node.children.set(token, { children: /* @__PURE__ */ new Map(), ends: [] });
          node = node.children.get(token);
        }
        node.ends.push(index);
      });
      const scores = new Array(names2.length).fill(-Infinity);
      const zeros2 = new Float32Array(H);
      async function visit(node, logp, logits2, before, at2) {
        let top = -Infinity;
        for (let i = 0; i < manifest.image_token_id; i += 1) if (logits2[i] > top) top = logits2[i];
        let total = 0;
        for (let i = 0; i < manifest.image_token_id; i += 1) total += Math.exp(logits2[i] - top);
        const normalizer = top + Math.log(total);
        for (const [token, child] of node.children) {
          const value = logp + logits2[token] - normalizer;
          for (const index of child.ends) scores[index] = value;
          if (child.children.size) {
            const next = await run([token], [[at2 + 1], [at2 + 1], [at2 + 1]], new Float32Array(1), zeros2, zeros2, zeros2, before);
            const data = Float32Array.from(next.logits.data);
            next.logits.dispose?.();
            await visit(child, value, data, next.cache, at2 + 1);
            next.cache.forEach((t) => t.dispose?.());
          }
        }
      }
      await visit(root, 0, first, past, position);
      const mass = scores.reduce((sum, value) => sum + Math.exp(value), 0);
      return { actions: names2.map((name, index) => ({ name, p: mass > 0 ? Math.exp(scores[index]) / mass : 0 })).sort((a, b) => b.p - a.p), mass };
    }
    self.postMessage({ type: "prefill", id: activeId, completed: 0, total: S });
    let logits = await forward(ids, pos, mask, embeds, deep0, deep1);
    const generated = [];
    const zeros = new Float32Array(H);
    const decodeStart = performance.now();
    let finished = false;
    let capHit = false;
    const names = Array.isArray(message.actions) ? message.actions : [];
    let scored = names.length === 0;
    for (let i = 0; i < cap && !cancelled; i += 1) {
      logits.data.fill(-Infinity, manifest.image_token_id);
      const token = sample(logits.data, temperature, message.samplingDraws[i]);
      const here = scored ? null : Float32Array.from(logits.data);
      logits.dispose();
      if (token === manifest.eos_token_id) {
        finished = true;
        break;
      }
      generated.push(token);
      if (!scored && />/.test(tokenizer.decode([token], { skip_special_tokens: true }))) {
        const text2 = tokenizer.decode(generated, { skip_special_tokens: true });
        const marker = "<action>";
        const index = text2.indexOf(marker);
        if (index >= 0) {
          scored = true;
          const before = tokenizer.decode(generated.slice(0, -1), { skip_special_tokens: true });
          const rest = text2.slice(before.length, index + marker.length);
          const result = await actionDistribution(names, rest, here, cache, lastPosition);
          self.postMessage({ type: "actions", id: activeId, ...result });
        }
      }
      if (i % 4 === 0 || i === cap - 1) {
        self.postMessage({
          type: "tokens",
          id: activeId,
          text: tokenizer.decode(generated, { skip_special_tokens: true }),
          tokens: generated.length,
          tokensPerSecond: generated.length / Math.max(1e-3, (performance.now() - decodeStart) / 1e3)
        });
      }
      if (i === cap - 1) {
        capHit = true;
        break;
      }
      lastPosition += 1;
      logits = await forward([token], [[lastPosition], [lastPosition], [lastPosition]], new Float32Array(1), zeros, zeros, zeros);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const text = generated.length ? tokenizer.decode(generated, { skip_special_tokens: true }) : "";
    output = {
      type: "result",
      id: activeId,
      text,
      tokens: generated.length,
      seconds: (performance.now() - started) / 1e3,
      cancelled,
      capHit: capHit && !finished
    };
    output.answer = readAnswer(generated, table, names, manifest.memory?.chars ?? 300);
  } finally {
    tensors.forEach((t) => t.dispose?.());
    cache.forEach((t) => t.dispose?.());
    activeId = null;
  }
  self.postMessage(output);
}
self.onmessage = ({ data }) => {
  if (data.type === "cancel") {
    if (data.id === activeId) cancelled = true;
    return;
  }
  const task = data.type === "load" ? load(data.directory) : data.type === "generate" ? generate(data) : Promise.reject(new Error("Unknown model command"));
  task.catch((error) => self.postMessage({ type: "error", id: data.id ?? null, message: error.stack || String(error) }));
};
/*! Bundled license information:

onnxruntime-web/dist/ort.wasm.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.22.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
