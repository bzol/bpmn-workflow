/* export const NodeTypeXmlToType = { */
/* 		'bpmn2:startEvent': NodeType.StartEvent, */
/* 		'bpmn2:endEvent' : NodeType.EndEvent, */
/* 		'bpmn2:task' : NodeType.Task, */
/* 		'bpmn2:manualTask' : NodeType.Task, */
/* 		'bpmn2:exclusiveGateway' : NodeType.ExclusiveGateway, */
/* 		'bpmn2:parallelGateway' : NodeType.ParallelGateway, */
/* } */

export enum EdgeType {
  Normal,
  InExclusive,
  OutExclusive,
  InParallel,
  OutParallel,
}

export enum NodeType {
  StartEvent,
  EndEvent,
  Task,
  ExclusiveGateway,
  ParallelGateway,
}

export enum ErrorCode {
	success = 0,
	failure = 1
}

export interface Node {
  id: string;
	org: string;
	type: NodeType;
	vars?: string[];
}

export interface Edge {
  id: string;
  inode: string;
  onode: string;
  type: EdgeType;
  travelled: boolean; 
  condition: string; 
}

export interface Variable {
	name: string;
	value: string;
}

export interface Process {
	id: string;
  nodes: Node[];
  edges: Edge[];
	variables: Variable[];
}

export interface State {
	processes : Process[];
}

export interface Error {
	code: ErrorCode;
	message: string;
}

export type Maybe = Process | Node[] | Error;
