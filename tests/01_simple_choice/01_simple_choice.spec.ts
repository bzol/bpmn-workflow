import { parseBpmn } from '../../src/parser';
import { Edge, EdgeType, Node, Process } from '../../src/types';
import {fetchActiveNodes, travel, init, setVariables} from '../../src/engine';
import {clone} from '../../src/utils';
import * as fs from 'fs';

// https://medium.com/criteo-engineering/introduction-to-property-based-testing-f5236229d237

/* test variables */
const simple_choice = 
{
  id: "process1",
  nodes: [
    { id: "StartEvent_1", org: "Process_1", type: 0 },
    { id: "t1", org: "Process_1", type: 2 },
    { id: "EndEvent_03ulb17", org: "Process_1", type: 1 },
    { id: "eg1", org: "Process_1", type: 3 },
    { id: "t2", org: "Process_1", type: 2 },
    { id: "t3", org: "Process_1", type: 2 },
    { id: "eg2", org: "Process_1", type: 3 },
    { id: "t4", org: "Process_1", type: 2 }
  ],
  edges: [
    { id: "SequenceFlow_05sf6ve", inode: "StartEvent_1", onode: "t1", travelled: false, condition: "" },
    { id: "SequenceFlow_07gr18a", inode: "t1", onode: "eg1", travelled: false, condition: "" },
    { id: "SequenceFlow_0v0ibqo", inode: "t3", onode: "eg2", travelled: false, condition: "" },
    { id: "SequenceFlow_0lofby0", inode: "t2", onode: "eg2", travelled: false, condition: "" },
    { id: "SequenceFlow_1n4mtpp", inode: "eg2", onode: "t4", travelled: false, condition: "" },
    { id: "SequenceFlow_0sj5dag", inode: "t4", onode: "EndEvent_03ulb17", travelled: false, condition: "" },
    { id: "SequenceFlow_0nn2ve1", inode: "eg1", onode: "t2", travelled: false, condition: "param == 0" },
    { id: "SequenceFlow_1298ibv", inode: "eg1", onode: "t3", travelled: false, condition: "param == 1" }
  ],
  variables: [{ name: "param", value: null }]
}

const simple_choice_final = 
{
  id: "process1",
  nodes: [
    { id: "StartEvent_1", org: "Process_1", type: 0 },
    { id: "t1", org: "Process_1", type: 2 },
    { id: "EndEvent_03ulb17", org: "Process_1", type: 1 },
    { id: "eg1", org: "Process_1", type: 3 },
    { id: "t2", org: "Process_1", type: 2 },
    { id: "t3", org: "Process_1", type: 2 },
    { id: "eg2", org: "Process_1", type: 3 },
    { id: "t4", org: "Process_1", type: 2 }
  ],
  edges: [
    { id: "SequenceFlow_05sf6ve", inode: "StartEvent_1", onode: "t1", travelled: true, condition: "" },
    { id: "SequenceFlow_07gr18a", inode: "t1", onode: "eg1", travelled: true, condition: "" },
    { id: "SequenceFlow_0v0ibqo", inode: "t3", onode: "eg2", travelled: true, condition: "" },
    { id: "SequenceFlow_0lofby0", inode: "t2", onode: "eg2", travelled: false, condition: "" },
    { id: "SequenceFlow_1n4mtpp", inode: "eg2", onode: "t4", travelled: true, condition: "" },
    { id: "SequenceFlow_0sj5dag", inode: "t4", onode: "EndEvent_03ulb17", travelled: true, condition: "" },
    { id: "SequenceFlow_0nn2ve1", inode: "eg1", onode: "t2", travelled: false, condition: "param == 0" },
    { id: "SequenceFlow_1298ibv", inode: "eg1", onode: "t3", travelled: true, condition: "param == 1" }
  ],
  variables: [{ name: "param", value: '1' }]
}

const travelled_choice = _.cloneDeep(simple_choice);
travelled_choice.edges[0].travelled = true;

describe('Simple Choice tests', () => {

	/* validator tests */
	/* parser tests */

	/* engine tests */

	test('testing setVariables', () => {
		expect(setVariables(simple_choice, [{name: 'param', value: '1'}]).variables).toStrictEqual([{name: 'param', value: '1'}]);
	})

	test('activeNodes test', () => {
		expect(fetchActiveNodes(simple_choice)).toStrictEqual([{ id: "StartEvent_1", org: "Process_1", type: 0, }]);
		expect(fetchActiveNodes(travelled_choice)).toStrictEqual([{ id: "t1", org: "Process_1", type: 2 }]);
	})

	test('init test', () => {
		expect(init(simple_choice)).toStrictEqual(travelled_choice);
	})

	test('a walkthrough over the diagram up to the end', () => {
		const startEvent = travel(clone(simple_choice), { id: "StartEvent_1", org: "Process_1", type: 0 , "vars": [] }, []);
		const t1 = travel(clone(startEvent), { id: "t1", org: "Process_1", type: 2 , "vars": [] }, [{name: 'param', value: '1'}]);
		const t3 = travel(clone(t1), { id: "t3", org: "Process_1", type: 2 , "vars": [] }, []);
		const t4 = travel(clone(t3), { id: "t4", org: "Process_1", type: 2 , "vars": [] }, []);
		expect(t4).toStrictEqual(simple_choice_final);
	})
});
