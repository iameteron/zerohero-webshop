"""Freeze the public small_synthetic eval catalog, native HTML and Lucene term scores."""
import argparse
from collections import defaultdict
import gzip
import json
from pathlib import Path
import re
from jinja2 import Environment, FileSystemLoader, select_autoescape
from rezero_world.webshop_env import WebShop, INSTRUCTIONS


def main(upstream, dest):
    env = WebShop(upstream,benchmark='small_synthetic',seed=1000)
    from web_agent_site.engine import goal as reward
    from pyserini.analysis import Analyzer, get_lucene_analyzer
    from bs4 import BeautifulSoup
    server=env.server
    products=server.all_products
    goals=server.goals[:500]
    searcher=server.search_engine
    lookup={p['asin']:i for i,p in enumerate(products)}
    templates=Environment(loader=FileSystemLoader(upstream/'web_agent_site/templates'),autoescape=select_autoescape(['html']))
    templates.globals['url_for']=lambda *a,**k:'#'
    def html(name, **kw):
        text=templates.get_template(name+'_page.html').render(session_id='demo',instruction_text='__TASK__', keywords=[],show_attrs=False,**kw)
        return re.sub(r'<!--.*?-->', '', text.split('<body>',1)[1].split('</body>',1)[0],flags=re.S).strip()
    def results(page,items):
        return html('results',products=items,page=page,total='__TOTAL__')
    # One DOM skeleton per page type. Result cards and item details use the original templates.
    token=dict(MainImage='https://example.invalid/',asin='__ASIN__',Title='__TITLE__',Price='__PRICE__')
    soup=BeautifulSoup(results(1,[token]),'html.parser')
    card=soup.select_one('.list-group-item')
    shell={}
    for page in (1,2):
        body=BeautifulSoup(results(page,[token]),'html.parser')
        body.select_one('.list-group-item').replace_with(body.new_tag('template',id='cards'))
        body.h3.string='Page __PAGE__ (Total results: __TOTAL__)'
        shell[page]=str(body)
    catalog=[]
    for p in products:
        kw=dict(product_info=p,asin=p['asin'],options={},page=1)
        catalog.append(dict(asin=p['asin'],title=p['Title'],price=p['Price'],image=p['MainImage'],
            options=p['options'],optionImages=p['option_to_image'],category=p['category'],query=p['query'],
            attributes=p['Attributes'],pages={name:html(name,**kw) for name in ('item','description','features','review')}))
    print('templates',len(catalog),flush=True)
    # Cache native attribute and option matches. Purchase scores are calculated for the actual chosen options.
    attrs={a for g in goals for a in g['attributes']}
    attr_matches={a:[int(reward.get_attribute_reward(p,dict(attributes=[a]))[1]) for p in products] for a in attrs}
    option_values={v for p in products for vs in p['options'].values() for v in vs}
    goal_options={tuple(x) for g in goals for x in g['goal_options'].items()}
    opt_matches={x:[v for v in option_values if reward.get_option_reward([v],[x])[1]] for x in goal_options}
    def nouns(doc):
        return [t.text.lower() for t in doc if t.pos_ in ('PNOUN','NOUN','PROPN')]
    names=list(dict.fromkeys([p['name'] for p in products]+[g['name'] for g in goals]))
    noun_map={name:nouns(doc) for name,doc in zip(names,reward.nlp.pipe(names,batch_size=64))}
    reward_cache={}
    def type_reward(p,g):
        a=noun_map[p['name']];b=noun_map[g['name']]
        score=len(set(a)&set(b))/len(b) if b else .2
        cats=lambda x:{v.strip() for v in x.split('›')}
        match=p['query']==g['query'] or len(cats(p['product_category'])&cats(g['product_category']))>=2 or score>.2
        return 0 if score==0 else .1 if score<.1 else 1 if match else .5
    tasks=[]
    for g in goals:
        # Multiply known counts by the native type gain at purchase time.
        if g['asin'] not in reward_cache:
            reward_cache[g['asin']]=[type_reward(p,g) for p in products]
        tasks.append(dict(text=g['instruction_text'],kind=g['asin'],divisor=len(g['attributes'])+len(g['goal_options'])+1,
            matched=[sum(attr_matches[a][i] for a in g['attributes'])+int(server.product_prices[p['asin']]<=g['price_upper']) for i,p in enumerate(products)],
            optionKeys=[json.dumps(x,ensure_ascii=False) for x in g['goal_options'].items()]))
    print('rewards',len(tasks),flush=True)
    analyzer=Analyzer(get_lucene_analyzer())
    word_pattern=r"[^\W_]+(?:['’.,][^\W_]+)*"
    words=set()
    for i in range(searcher.num_docs):
        raw=json.loads(searcher.doc(i).raw())['contents'].lower()
        words.update(re.findall(word_pattern,raw))
    for t in tasks:words.update(re.findall(word_pattern,t['text'].lower()))
    norm={}; representatives={}
    for word in sorted(words):
        terms=analyzer.analyze(word)
        norm[word]=terms
        if len(terms)==1:representatives.setdefault(terms[0],word)
    from lucene_scores import raw_scores
    scores=raw_scores(searcher,representatives,lookup)
    print('native index',len(scores),flush=True)
    payload=dict(instructions=INSTRUCTIONS,catalog=catalog,tasks=tasks,types=reward_cache,
        optionMatches={json.dumps(k,ensure_ascii=False):v for k,v in opt_matches.items()},
        norm=norm,scores=scores,search=html('search'),shell=shell,card=str(card))
    with gzip.open(dest,'wt',encoding='utf8') as f:json.dump(payload,f,ensure_ascii=False,separators=(',',':'))
    print(dest.stat().st_size,flush=True)


if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('upstream',type=Path);p.add_argument('dest',type=Path);a=p.parse_args()
    main(a.upstream,a.dest)
