import { Edge, EdgeType, Node, Variable, Process, Maybe, NodeType} from './types';
import * as _ from "lodash";

const getInputEdges = (process, node) => process.edges.filter(edge => edge.onode === node.id);
const getOutputEdges = (process, node) => process.edges.filter(edge => edge.inode === node.id);

const isNextGateway = (process, edge) => {
	if(getNode(process, edge.onode).type === NodeType.ExclusiveGateway)
		return true;
	if(getNode(process, edge.onode).type === NodeType.ParallelGateway &&
		 getInputEdges(process, edge.onode).filter(iedge => iedge.travelled === false).length === 0)
		return true;
  return false;
}

/* checks next edges if any of them are loops */
const checkForLoop = (process, edge) => {
	const outputEdges = getOutputEdges(process, getNode(process, edge.onode));
	/* if(outputEdges.filter(oe => oe.travelled == true) */
  return false;
}


const clearNextEdges = (process, node) => {
	const outputEdges = getOutputEdges(process, node);
	outputEdges.map(oe => {
		if(oe.travelled === false)
			return;
		process.edges.find(edge => edge.id === oe.id).travelled = false;
		clearNextEdges(process, getNode(process, oe.onode));
	})

  return process;
};

export const setVariables = (process, taskVars) => {
	process.variables = process.variables.map(ptv => {
								if(taskVars.length === 0)
									return ptv;
							   const value = taskVars.find(x => x.name === ptv.name).value;
								 if(value === undefined)
									 return ptv;
								 return {name: ptv.name, value};
							})
  return process;
}

/* NOT SECURE DESERIALIZATION */;
const evalCondition = (process, condition) => {//
	let evalString = 'function evaluate() {';
	process.variables.map(v => {
		evalString += 'const ' + v.name + ' = ' + v.value + ';';
	})
	evalString += 'return ' + condition;
	evalString += '} evaluate();';

	return eval(evalString);
}

const getNode = (process, id) => process.nodes.find(n => n.id === id);

/************************ EXPORTS ************************/

export const travelGuard = (process, node, taskVars) => {
	// guard against bad input,
	// like deserialization attacks
	// or bad evalConditions
	// or if they don't set a value when they should
	return {code: 0, message: 'travelGuard Success!'}};

	// supports one startEvent
export const init = (process) => {
	// move from startevent to first task
	const startEvent = fetchActiveNodes(process).filter(x => x.type === NodeType.StartEvent)[0];
	travel(process, startEvent, []);

	return process;
}

export const fetchActiveNodes = (process) => {
	const nodes = process.nodes.filter(node => {
		const iEdges = process.edges.filter(e => e.onode === node.id);
		const oEdges = process.edges.filter(e => e.inode === node.id); 

		// TODO Check for parallels, node should not be active if some of 
		// its inputs are from parallel edges that are not travelled
		if(iEdges.length === 0 && (oEdges.filter(e => e.travelled === true).length === 0))
			return true;
		if((iEdges.filter(e => e.travelled === true).length !== 0) 
			 && (oEdges.filter(e => e.travelled === true).length === 0))
			return true;

		return false;
	})

  return nodes;
};

export const travel = (process, node : Node, taskVars : Variable[]) => {
	const travelList : Edge[] = [];
	const nextEdges : Edge[] = [];

	process = setVariables(process, taskVars);
	process.edges = process.edges.map(edge => {
		if(edge.inode === node.id && (edge.condition === '' || evalCondition(process, edge.condition))) {
			if(isNextGateway(process, edge))
				travelList.push(edge);
			/* if(checkForLoop(process, edge)) */
			/* 	loopList.push(edge); */
			nextEdges.push(edge);
				
			return {...edge, travelled: true};
		}
		return edge;
	});

	nextEdges.map(tl => clearNextEdges(process, getNode(process, tl.onode)));

	travelList.map(tl => travel(process, getNode(process, tl.onode), []));

	return process;
};
