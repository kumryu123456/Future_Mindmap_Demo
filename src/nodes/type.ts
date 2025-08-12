import { CurrentNodeData } from "@/nodes/CurrentNode";
import { FinalNodeData } from "@/nodes/FinalNode";
import { IntermediateNodeData } from "@/nodes/IntermediateNode";

export type NodeData = CurrentNodeData | FinalNodeData | IntermediateNodeData;
