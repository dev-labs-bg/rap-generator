#! /usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, Response, request
import scraper, json, markov_chain
from flask_cors import CORS, cross_origin


app = Flask(__name__)
CORS(app)


# NOTE <Yavor>: I load these on startup and keep them, because reading from
# file on every request is slow.
cache = dict(
    authors=[dict(name=name, slug=slug, cached=scraper.has_cached_lyrics(slug)) for name, slug in scraper.get_artists().iteritems()],
)
cache['cached'] = [a for a in cache['authors'] if a['cached'] == True]
cache['not_cached'] = [a for a in cache['authors'] if a['cached'] == False]

@app.route('/authors', methods=['GET'])
def get_authors():
    cached = json.loads(request.args.get('cached', 'null'))
    # authors = [dict(name=name, slug=slug, cached=scraper.has_cached_lyrics(slug)) for name, slug in scraper.get_artists().iteritems()]
    authors = cache['authors']
    if cached is not None:
        authors = cache['cached'] if cached else cache['not_cached']
        # authors = [a for a in cached_authors if a['cached'] == cached]
    return Response(response=json.dumps(authors), status=200,
                    mimetype="application/json")


@app.route('/all_lyrics/<string:artist>', methods=['GET'])
def get_all_lyrics(artist):
    return Response(json.dumps(dict(lyrics=scraper.get_lyrics(artist))),
                   status=200, mimetype="application/json")


@app.route('/generate_lyrics', methods=['POST'])
def get_generated_lyrics():
    artists = request.form['authors'].split(',')
    lyrics = ''
    for a in artists:
        lyrics += scraper.get_lyrics(a) + '\n'
    sentence_count = int(request.form.get('sentence_count', 5))
    banned_word_count = int(request.form.get('banned_word_count', 100))
    attempts = int(request.form.get('attempts', 10))
    state_size = int(request.form.get('state_size', 2))
    text_model = markov_chain.get_model(text=lyrics, state_size=state_size)
    sentences = markov_chain.generate_sentences(text_model, sentence_count, state_size,
                                               banned_word_count=banned_word_count, attempts=attempts)
    return Response(json.dumps(sentences), status=200, mimetype="application/json")


@app.route('/')
def hello_world():
    return 'Hello, World!'


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)
