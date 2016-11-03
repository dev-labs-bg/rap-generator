#! /usr/bin/env python
# -*- coding: utf-8 -*-

import markovify, sys, random, collections, itertools, os


def argv_or_const(idx, const):
    return sys.argv[idx] if len(sys.argv) > idx else const


def word_freq(words):
    return collections.Counter(words)


def get_model(text="", file="", json_file="", state_size=2):
    if not text and file:
        text = get_text(file).decode('utf-8')
    if not os.path.isfile(json_file):
        return markovify.Text(text, state_size=state_size)
    json = get_text(json_file)
    return markovify.Text(text, chain=markovify.Chain.from_json(json))


def get_text(file):
    with open(file) as f:
        text = f.read()
    return text


def save_state(json_file, model):
    with open(json_file, 'w') as f:
        f.write(model.chain.to_json())


def word_choice(text_model, last_sentence, words_to_generate, banned_words=[],  attempts=10, text=''):
    if not last_sentence:
        return None
    word_freq_lookup = word_freq(itertools.chain(*text_model.generate_corpus(text)))
    available_words = {w:word_freq_lookup[w] for w in text_model.word_split(last_sentence)}
    available_words = [w for w, occurences in collections.Counter(available_words).most_common()]
    chosen_words = [w for w in available_words if w not in banned_words and len(w) >= 4]
    chosen_words = chosen_words[:words_to_generate]
    return tuple(chosen_words) if chosen_words else None


def generate_sentence(text_model, state_size, input_words=None, attempts=10, text=''):
    out = None
    for i in range(attempts):
        try:
            out = text_model.make_sentence(init_state=input_words)
            break
        except KeyError:
            if len(input_words) > 2*state_size:
                input_words = tuple(list(input_words)[state_size:])
            else:
                input_words = None
    return out


def generate_sentences(text_model, sentence_count, state_size,
                       banned_word_count=10, attempts=10):
    last_sentence = None
    banned_words = []
    sentences = []
    while sentence_count:
        input_words = word_choice(text_model, last_sentence, state_size, banned_words)
        if input_words:
            banned_words.extend(input_words)
            if len(banned_words) > banned_word_count:
                banned_words = banned_words[-banned_word_count:]
        sentence = generate_sentence(text_model, state_size, input_words, attempts)
        if sentence is None:
            sentence = generate_sentence(text_model, state_size, attempts)
        if sentence:
            last_sentence = sentence
            sentences.append(sentence)
            sentence_count = sentence_count - 1
        if sentence_count == 0:
            break
    return sentences


if __name__ == '__main__':
    file = argv_or_const(1, "input_alt.txt")
    json_file = "%s.json" % os.path.splitext(file)[0]
    sentence_count = int(argv_or_const(2, 8))
    state_size = int(argv_or_const(3, 2))
    text_model = get_model(file=file, json_file=json_file, state_size=state_size)
    print('-----------------------')
    print(generate_sentences(text_model, sentence_count, state_size, banned_word_count=100,
                             attempts=10))
    print('-----------------------')
    save_state(json_file, text_model)
