import FlowFieldGrid from "./FlowFieldGrid";
import FlowFieldVoronoi from "./FlowFieldVoronoi";
import FlowFieldTrails from "./FlowFieldTrails";
import FlowFieldTrails3D from "./FlowFieldTrails3D";
import SlowFlowTrails from "./SlowFlowTrails";
import EvolvingParticleLife from "./EvolvingParticleLife";
import MagneticParticleConnections from "./MagneticParticleConnections";
import SynthwaveHexGlow from "./SynthwaveHexGlow";
import TriangleMeshFlow from "./TriangleMeshFlow";
import RectanglePackFlow from "./RectanglePackFlow";
import PlotterFlowPath from "./PlotterFlowPath";

const sketches = {
  PlotterFlowPath,
  FlowFieldGrid,
  FlowFieldVoronoi,
  FlowFieldTrails,
  FlowFieldTrails3D,
  SlowFlowTrails,
  EvolvingParticleLife,
  MagneticParticleConnections,
  SynthwaveHexGlow,
  TriangleMeshFlow,
  RectanglePackFlow
};

export default { ...sketches };
