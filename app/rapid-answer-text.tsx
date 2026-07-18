import { InlineMath, RichMathText } from "./statistics-math";
import { unwrapRapidMath } from "./rapid-quiz-data";
import { isPureRapidTex } from "./rapid-answer-format";

type RapidAnswerTextProps = {
  value: string;
  mathOptions?: boolean;
  emphasizeRichText?: boolean;
};

export default function RapidAnswerText({ value, mathOptions = false, emphasizeRichText = false }: RapidAnswerTextProps) {
  if (isPureRapidTex(value, mathOptions)) {
    return <InlineMath tex={unwrapRapidMath(value)} />;
  }

  const content = <RichMathText text={value} />;
  return emphasizeRichText ? <strong>{content}</strong> : content;
}
