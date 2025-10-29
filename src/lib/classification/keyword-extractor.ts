import keywordExtractor from 'keyword-extractor';
import natural from 'natural';

function extractKeywords(text: string, language: string): string[] {
    // Tokenization
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Extraction via keyword-extractor
    const keywords = keywordExtractor.extract(text, {
        language: language === 'fr' ? 'french' : 'english',
        remove_digits: false,
        return_changed_case: true,
        remove_duplicates: true
    });

    // Stemming pour normalisation
    const stemmer = language === 'fr'
        ? natural.PorterStemmerFr
        : natural.PorterStemmer;

    return keywords.map(k => stemmer.stem(k));
}