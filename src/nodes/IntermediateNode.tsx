import { memo } from "react";
import { Handle, Node, Position, type NodeProps } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { ArrowRight } from "lucide-react";
import { NodeContextMenu } from "@/app/ai-career/components/NodeContextMenu";

type NodeInfo = {
  certification?: {
    name: string;
    difficulty: string;
    eligibility: string;
    examStructure: string;
    schedule: string;
    recommendedBooks: {
      title: string;
      description: string;
      category: "written" | "practical";
    }[];
    recommendedCourses: {
      title: string;
      description: string;
      platform: string;
    }[];
  };
  skillInfo?: {
    description: string;
    prerequisites: string[];
    learningResources: {
      title: string;
      description: string;
      type: "book" | "course" | "documentation" | "project";
      url?: string;
    }[];
    estimatedTime: string;
    difficulty: "초급" | "중급" | "고급";
  };
};

type NodeReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: Date;
  helpful: number;
};

export type IntermediateNodeData = Node<{
  label: string;
  info: NodeInfo;
  reviews: NodeReview[];
}>;

export const IntermediateNode = memo(
  ({ data, id }: NodeProps<IntermediateNodeData>) => {
    return (
      <NodeContextMenu id={id}>
        <BaseNode className="w-28 h-16 rounded-[20px] bg-gray-100 text-gray-700 border-2 border-gray-300">
          <Handle
            type="source"
            position={Position.Top}
            className="w-3 h-3 bg-gray-400 border-2 border-white"
          />
          <Handle
            type="target"
            position={Position.Bottom}
            className="w-3 h-3 bg-gray-400 border-2 border-white"
          />

          <BaseNodeContent className="p-2 text-center flex items-center justify-center h-full">
            <div className="flex items-center gap-1">
              <ArrowRight className="size-3 flex-shrink-0" />
              <BaseNodeHeaderTitle className="text-xs font-medium leading-tight">
                {data.label}
              </BaseNodeHeaderTitle>
            </div>
          </BaseNodeContent>
        </BaseNode>
      </NodeContextMenu>
    );
  },
);

IntermediateNode.displayName = "IntermediateNode";
