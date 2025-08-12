import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { NodeData } from "@/nodes/type";
import { ContextMenuProps } from "@radix-ui/react-context-menu";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

interface NodeContextMenuProps extends ContextMenuProps {
  id: string;
}

export const NodeContextMenu = ({
  id,
  children,
  ...props
}: NodeContextMenuProps) => {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow<NodeData>();
  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNodes({
      ...node,
      selected: false,
      dragging: false,
      id: `${node.id}-copy`,
      position,
    });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={duplicateNode} inset>
          복제하기
        </ContextMenuItem>
        <ContextMenuItem onClick={deleteNode} inset>
          삭제하기
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
