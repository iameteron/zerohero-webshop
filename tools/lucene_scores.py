"""Extract full-precision term scores before Anserini rounds displayed search scores."""
from jnius import autoclass
from pyserini.index.lucene import IndexReader


def raw_scores(searcher, terms, lookup):
    reader = IndexReader(searcher.index_dir).reader
    index = autoclass('org.apache.lucene.search.IndexSearcher')(reader)
    index.setSimilarity(searcher.get_similarity())
    term_query = autoclass('org.apache.lucene.search.TermQuery')
    term_class = autoclass('org.apache.lucene.index.Term')
    product = [lookup[searcher.doc(i).docid()] for i in range(searcher.num_docs)]
    result = {}
    for word in terms:
        query = term_query(term_class('contents', word))
        hits = index.search(query, searcher.num_docs).scoreDocs
        result[word] = [[product[h.doc], h.score] for h in hits]
    return result
