import { memo } from "react";
import { Handle, Node, Position, type NodeProps } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Trophy } from "lucide-react";

export type FinalNodeData = Node<{
  label: string;
}>;

export const FinalNode = memo(({ data }: NodeProps<FinalNodeData>) => {
  return (
    <BaseNode className="w-36 h-20 rounded-[20px] bg-sky-300 text-slate-900 border-2 border-sky-500">
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-3 h-3 bg-sky-600 border-2 border-white"
      />

      <BaseNodeContent className="p-2 text-center flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 flex-shrink-0 text-sky-700" />
          <BaseNodeHeaderTitle className="text-sm font-bold leading-tight">
            {data.label}
          </BaseNodeHeaderTitle>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
});

FinalNode.displayName = "FinalNode";
