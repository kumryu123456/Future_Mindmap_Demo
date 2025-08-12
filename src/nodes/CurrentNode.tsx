import { memo } from "react";
import { Handle, Node, Position, type NodeProps } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { User } from "lucide-react";

export type CurrentNodeData = Node<{
  label: string;
}>;

export const CurrentNode = memo(({ data }: NodeProps<CurrentNodeData>) => {
  return (
    <BaseNode className="w-32 h-32 rounded-full bg-blue-800 text-white border-2 border-blue-800 flex items-center justify-center">
      <Handle
        type="source"
        position={Position.Top}
        className="w-3 h-3 bg-blue-600 border-2 border-white"
      />

      <BaseNodeContent className="p-2 text-center">
        <User className="size-6 mx-auto mb-1" />
        <BaseNodeHeaderTitle className="text-xs font-bold leading-tight text-white">
          {data.label}
        </BaseNodeHeaderTitle>
      </BaseNodeContent>
    </BaseNode>
  );
});

CurrentNode.displayName = "CurrentNode";
