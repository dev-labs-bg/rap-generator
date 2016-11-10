#! /usr/bin/env python
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
from urllib2 import urlopen
from os import path
import json, sys, pprint


BASE_LYRICS_DIR = './lyrics/'
BASE_URL = "http://textove.com/"


def make_soup(url):
    html = urlopen(url).read()
    return BeautifulSoup(html, "lxml")


def parse_lyrics(section_url):
    soup = make_soup(section_url)
    text_node = soup.select("div#maintxt")
    if not text_node:
        return ''
    text = ' '.join(text_node[0].findAll(text=True))
    return text[2:len(text)-1]


def parse_url_list(base_url, section_url):
    soup = make_soup(section_url)
    songs = soup.select(".uolist li a")
    links = [base_url + l.get("href") for l in songs]
    return links


def get_lyrics_from_http(base_url, author):
    url = "%s%s" % (base_url, author)
    all_lyrics = ''
    soup = make_soup(url)
    last_page = soup.select('.pagination a')
    last_page = (int(last_page[-2].get_text()) + 1) if last_page else 2
    for idx in range(1, last_page):
        url = '%s&page=%d' % (url, idx)
        links = parse_url_list(base_url, url)
        for l in links:
            text = parse_lyrics(l)
            all_lyrics += text.encode('utf-8')
    return all_lyrics


def get_artists_from_http(base_url):
    url = '%s%s' % (base_url, 'artists.html')
    soup = make_soup(url)
    letters = soup.select('.lettersNav a')
    artists = dict()
    for l in letters:
        letter_url = '%s%s' % (base_url, l.get('href'))
        soup = make_soup(letter_url)
        last_page = soup.select('.pagination a')
        last_page = (int(last_page[-2].get_text()) + 1) if last_page else 2
        for idx in range(1, last_page):
            print "Started page %d letter %s" % (idx, l.get_text())
            tmp, ext = letter_url.rsplit('.', 1)
            url = '%s-%d.%s' % (tmp, idx, ext)
            soup = make_soup(url)
            artist_slugs = [a.get('href') for a in soup.select('.topArtists.list ul a')]
            artist_names = [s.get_text() for s in soup.select('.topArtists.list ul span')]
            artists.update(dict(zip(artist_names, artist_slugs)))
    return artists


def cache_artists_to_file(basedir, artists):
    file = "%sartists.txt" % basedir
    with open(file, 'w') as f:
        return f.write(json.dumps(artists))
    return None


def get_artists_from_file(basedir):
    file = "%sartists.txt" % basedir
    if path.isfile(file):
        with open(file) as f:
            return json.loads(f.read())
    return None


def has_cached_lyrics(author):
    file = "%s%s.txt" % (BASE_LYRICS_DIR, author)
    return path.isfile(file)


def get_lyrics_from_file(author):
    file = "%s%s.txt" % (BASE_LYRICS_DIR, author)
    if path.isfile(file):
        with open(file) as f:
            return f.read()
    return None


def get_artists():
    artists = get_artists_from_file(BASE_LYRICS_DIR)
    if artists is None:
        artists = get_artists_from_http(BASE_URL)
        cache_artists_to_file(BASE_LYRICS_DIR, artists)
    return artists


def cache_lyrics_to_file(author, lyrics):
    file = "%s%s.txt" % (BASE_LYRICS_DIR, author)
    with open(file, 'w') as f:
        return f.write(lyrics)
    return None


def get_lyrics(author):
    lyrics = get_lyrics_from_file(author)
    if lyrics is None:
        lyrics = get_lyrics_from_http(BASE_URL, author)
        cache_lyrics_to_file(author, lyrics)
    return lyrics


if __name__ == '__main__':
    artists = get_artists()
    print get_lyrics(artists.values()[0])
