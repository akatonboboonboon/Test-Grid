import MechanicalDynamicsDiagram from "./mechanical-dynamics-diagrams";
import ThermodynamicsDiagram from "./thermodynamics-diagrams";
import MaterialMechanicsDiagram from "./material-mechanics-diagrams";
import SmartControlDiagram from "./smart-control-diagrams";
import DigitalCircuitStudyDiagram from "./digital-circuits-extra-diagrams";
import EnglishWeatherFigure from "./english-weather-figure";
import type { RapidQuestionVisual as RapidQuestionVisualData } from "./rapid-quiz-data";

type Props = {
  visual?: RapidQuestionVisualData;
  solution?: boolean;
  compact?: boolean;
};

export default function RapidQuestionVisual({ visual, solution = false, compact = false }: Props) {
  if (!visual) return null;
  const title = solution ? "解答図" : "問題図";
  const className = `rapid-question-visual${compact ? " is-compact" : ""}${solution ? " is-solution" : ""}`;

  return (
    <div className={className} data-rapid-visual={visual.type}>
      {visual.type === "english-weather-homepage" && <EnglishWeatherFigure />}
      {visual.type === "mechanical-dynamics" && (
        <MechanicalDynamicsDiagram kind={visual.kind} solution={solution} title={title} />
      )}
      {visual.type === "thermodynamics" && (
        <ThermodynamicsDiagram kind={visual.kind} solution={solution} title={title} />
      )}
      {visual.type === "material-mechanics" && (
        <MaterialMechanicsDiagram kind={visual.kind} solution={solution} title={title} />
      )}
      {visual.type === "smart-control" && (
        <SmartControlDiagram diagramId={visual.kind} solution={solution} title={title} />
      )}
      {visual.type === "digital-circuit" && (
        <DigitalCircuitStudyDiagram kind={visual.kind} solution={solution} title={title} compact={compact} />
      )}
    </div>
  );
}