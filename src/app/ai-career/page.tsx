"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Star } from "lucide-react";
import { mockCareerMaps, type CareerMap } from "@/lib/career-map-types";
import { CurrentNode } from "@/nodes/CurrentNode";
import {
  IntermediateNode,
  IntermediateNodeData,
} from "@/nodes/IntermediateNode";
import { FinalNode } from "@/nodes/FinalNode";
import { NodeData } from "@/nodes/type";

// ReactFlow node types
const nodeTypes: NodeTypes = {
  current: CurrentNode,
  intermediate: IntermediateNode,
  final: FinalNode,
};

export default function AICareerPage() {
  const router = useRouter();
  const [careerMaps] = useState<CareerMap[]>(mockCareerMaps);
  const [selectedNode, setSelectedNode] = useState<IntermediateNodeData | null>(
    null,
  );
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Redirect to onboarding if no career maps
  useEffect(() => {
    if (careerMaps.length === 0) {
      router.push("/ai-career/onboarding");
      return;
    }

    // Set first career map as selected if none selected
    if (!selectedMapId && careerMaps.length > 0) {
      setSelectedMapId(careerMaps[0].id);
    }
  }, [careerMaps, selectedMapId, router]);

  // Update ReactFlow nodes when selected map changes
  useEffect(() => {
    if (!selectedMapId) return;

    const selectedMap = careerMaps.find((map) => map.id === selectedMapId);
    if (!selectedMap) return;

    const flowNodes = selectedMap.nodes;

    const flowEdges: Edge[] = [];
    // Add edges connecting the nodes (simplified logic)
    for (let i = 0; i < flowNodes.length - 1; i++) {
      if (flowNodes[i].id !== "final") {
        flowEdges.push({
          id: `${flowNodes[i].id}-${flowNodes[i + 1].id}`,
          source: flowNodes[i].id,
          target: flowNodes[i + 1].id,
          animated: true,
          style: { stroke: "#1E40AF", strokeWidth: 2 },
        });
      }
    }

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [selectedMapId, careerMaps]);

  const onNodesChange: OnNodesChange<NodeData> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: NodeData) => {
    if (node.type === "intermediate")
      setSelectedNode(node as IntermediateNodeData);
  }, []);

  const selectedMap = careerMaps.find((map) => map.id === selectedMapId);

  return (
    <div className="flex bg-white h-full">
      {/* Left Sidebar - Career Maps List */}
      <div className="w-80 h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">커리어 맵</h2>
          <Link href="/ai-career/onboarding">
            <Button className="w-full bg-blue-800 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />새 커리어 맵 생성
            </Button>
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {careerMaps.map((map) => (
              <button
                key={map.id}
                onClick={() => setSelectedMapId(map.id)}
                className="w-full p-0 hover:bg-blue-50 transition-colors"
              >
                <Card
                  className={`w-full cursor-pointer transition-colors ${
                    selectedMapId === map.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {map.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      목표: {map.targetRole}
                    </p>
                    <p className="text-xs text-gray-500">
                      {map.createdAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 flex h-full">
          {/* ReactFlow Section */}
          <div className="flex flex-col flex-1 ">
            {selectedMap && (
              <div className="m-6 flex-1 border border-gray-200 rounded-lg overflow-hidden">
                <ReactFlow
                  ref={ref}
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-white"
                >
                  <Background />
                </ReactFlow>
              </div>
            )}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 p-4 border-2 border-gray-300 rounded-full">
                  <input
                    type="text"
                    placeholder="원하는 수정 사항을 입력해주세요."
                    className="flex-1 text-gray-500 bg-transparent border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedNode && (
            <Tabs
              defaultValue="info"
              className="w-80 h-full flex flex-col border-l"
            >
              <div className="p-6">
                <h2 className="text-lg font-bold mb-4">
                  {selectedNode.data.label}
                </h2>
                <TabsList className="w-full p-1 h-12">
                  <TabsTrigger value="info">정보</TabsTrigger>
                  <TabsTrigger value="reviews">후기</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="info"
                className="flex-1 p-6 min-h-0 overflow-y-auto space-y-8"
              >
                {/* Skill Info */}
                {selectedNode.data.info.skillInfo && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">학습 정보</h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          설명
                        </h4>
                        <p className="text-sm text-gray-700">
                          {selectedNode.data.info.skillInfo.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          난이도
                        </h4>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {selectedNode.data.info.skillInfo.difficulty}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          예상 소요 시간
                        </h4>
                        <p className="text-sm text-gray-700">
                          {selectedNode.data.info.skillInfo.estimatedTime}
                        </p>
                      </div>

                      {selectedNode.data.info.skillInfo.prerequisites.length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            선수 조건
                          </h4>
                          <ul className="space-y-1">
                            {selectedNode.data.info.skillInfo.prerequisites.map(
                              (prereq, index) => (
                                <li
                                  key={index}
                                  className="flex items-center text-sm text-gray-700"
                                >
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                  {prereq}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {selectedNode.data.info.skillInfo.learningResources
                        .length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            학습 자료
                          </h4>
                          <div className="space-y-3">
                            {selectedNode.data.info.skillInfo.learningResources.map(
                              (resource, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-blue-200 pl-3"
                                >
                                  <p className="font-medium text-sm">
                                    <span className="text-blue-600">
                                      [
                                      {resource.type === "book"
                                        ? "도서"
                                        : resource.type === "course"
                                          ? "강의"
                                          : resource.type}
                                      ]
                                    </span>{" "}
                                    {resource.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {resource.description}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Certification Info */}
                {selectedNode.data.info.certification && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">자격증 정보</h3>

                    <h4 className="text-lg font-semibold mb-3">
                      {selectedNode.data.info.certification.name}
                    </h4>

                    <ul className="space-y-3 text-sm mb-6">
                      <li className="flex">
                        <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>
                          <strong>난이도:</strong>{" "}
                          {selectedNode.data.info.certification.difficulty}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>
                          <strong>응시 자격:</strong>{" "}
                          {selectedNode.data.info.certification.eligibility}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>
                          <strong>시험 구성:</strong>{" "}
                          {selectedNode.data.info.certification.examStructure}
                        </span>
                      </li>
                      <li className="flex">
                        <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>
                          <strong>시험 일정:</strong>{" "}
                          {selectedNode.data.info.certification.schedule}
                        </span>
                      </li>
                    </ul>

                    {/* Recommended Books */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">추천 교재</h4>
                      <div className="space-y-3">
                        {selectedNode.data.info.certification.recommendedBooks.map(
                          (book, index) => (
                            <div key={index}>
                              <p className="font-medium text-sm">
                                ({book.category === "written" ? "필기" : "실기"}
                                )
                                <span className="underline ml-1">
                                  {book.title}
                                </span>
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                → {book.description}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Recommended Courses */}
                    <div>
                      <h4 className="font-semibold mb-3">추천 온라인 강의</h4>
                      <div className="space-y-3">
                        {selectedNode.data.info.certification.recommendedCourses.map(
                          (course, index) => (
                            <div key={index}>
                              <p className="font-medium underline text-sm">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                → {course.description}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="reviews"
                className="flex-1 p-6 overflow-auto space-y-4"
              >
                {selectedNode.data.reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.author}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {review.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {review.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <button className="text-xs text-blue-600 hover:underline">
                        도움됨 ({review.helpful})
                      </button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
