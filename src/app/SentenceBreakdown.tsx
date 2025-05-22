const SentenceBreakdown = ({ vocab, meaning, sentenceStructure }) => {
  console.log('## SentenceBreakdown', {
    vocab,
    meaning,
    sentenceStructure,
  });

  return null;
};

export default SentenceBreakdown;
// <SentenceBreakdown
//   vocab={topicSentence.vocab}
//   meaning={topicSentence.meaning}
//   sentenceStructure={topicSentence.sentenceStructure}
//   textSegments={topicSentence.safeText.props.textSegments}
//   handleSaveWordInBreakdown={handleSaveWordInBreakdown}
// />
