import * as fs from 'fs';
import { parse } from 'fsp-xml-parser';
import { Edge, EdgeType, Node, NodeType, Variable, Process} from './types';

// parser should only receive well-formed bpmn, TODO: implement bpmn checker

// TODO convert these names to a data structure instead of switch case
const getNodeType = (name) => {
	switch(name){
		case 'bpmn2:startEvent':
			return NodeType.StartEvent;
		case 'bpmn2:endEvent':
			return NodeType.EndEvent;
		case 'bpmn2:task':
			return NodeType.Task;
		case 'bpmn2:manualTask':
			return NodeType.Task;
		case 'bpmn2:exclusiveGateway':
			return NodeType.ExclusiveGateway;
		case 'bpmn2:parallelGateway':
			return NodeType.ParallelGateway;
		default:
			return NodeType.Task;
	}
}

const createVariable = (process, xmlNode) => {
	const name = xmlNode.children?.[0].children?.[0].children?.[0].attributes?.name;
	return {name, value: null};
}

const createNode = (process, xmlNode) => {
	const attr = xmlNode['attributes'];
	const nodeVars = xmlNode.children?.[0].children?.[0].children;
	console.log(nodeVars)

	const node = {id: attr.id, org: process.attributes.id, type: getNodeType(xmlNode.name), vars: nodeVars?.map(nv => nv.attributes.name)};
	return node;
};

const createEdge = (process, sequenceFlow) => {
	const attr = sequenceFlow['attributes'];
  const edge = {id: attr.id, inode: attr.sourceRef, onode: attr.targetRef, travelled: false, condition: ''};
	if(typeof sequenceFlow['children'] !== 'undefined' &&
		 sequenceFlow['children'][0]['name'] === 'bpmn2:conditionExpression'
		){
		/* TODO check for data serialization security hole */
		edge.condition = sequenceFlow['children'][0]['content'];
		}
	return edge;
};

const getNodesFromXml = (process) => {
	const result = process['children'].filter(
	(x) => x['name'] === 'bpmn2:startEvent' ||
				 x['name'] === 'bpmn2:endEvent' ||
				 x['name'] === 'bpmn2:task' ||
				 x['name'] === 'bpmn2:manualTask' ||
				 x['name'] === 'bpmn2:exclusiveGateway' ||
				 x['name'] === 'bpmn2:parallelGateway' 
				 );
	return result;
}

const getVariablesFromXml = (process) => {
	const result = process['children'].filter(
	(x) => (x['name'] === 'bpmn2:task' ||
				 x['name'] === 'bpmn2:manualTask') &&
				 x.children?.[0].children?.[0].children?.[0].attributes?.name !== undefined
				 );
	/* console.log(process['children'][2].children) */
	/* console.log(process['children'][2].children?.[0].children?.[0].children?.[0].attributes?.name !== undefined) */
	/* console.log(process['children'][2].children?.[0].children?.[0].children?.[0].attributes?.name !== 'undefined') */
	return result;
				 /* (x['children'].find(x => x.children === 'bpmn2:extensionElements') !== 'undefined') //&& */
				 /* (x['children'].find(x => x.children === 'bpmn2:extensionElements') !== 'undefined') */
}

const getSequenceFlowsFromXml = (process) => {
	const result = process['children'].filter(
		(x) => x['name'] === 'bpmn2:sequenceFlow');
	return result;
}

const iterateProcesses = (processes, extractFromXml, createData) => {
  const result = [];
  processes.map((process) => {
    const extract = extractFromXml(process);
    extract.map((x) => {
      result.push(createData(process, x));
    });
  });
  return result;
}

// TODO for each task store its output variables
export const parseBpmn = (filename : string, processID : string) => {
  const file = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
  const parsed = parse(file);

  const processes = parsed['root']['children'].filter((x) => x['name'] === 'bpmn2:process');


  const nodes : Node[] = iterateProcesses(processes, getNodesFromXml, createNode);
  const edges : Edge[] = iterateProcesses(processes, getSequenceFlowsFromXml, createEdge);
  const variables : Variable[] = iterateProcesses(processes, getVariablesFromXml, createVariable);
	const returnProcess : Process  = {id: processID, nodes, edges, variables};

  return returnProcess;
};
