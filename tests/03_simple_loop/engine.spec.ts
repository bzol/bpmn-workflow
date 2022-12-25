import { parseBpmn } from '../src/parser';
import { Edge, EdgeType, Node, Process } from '../src/types';
import {fetchActiveNodes, travel, init, setVariables} from '../src/engine';
import * as fs from 'fs';
import * as _ from "lodash";

// https://medium.com/criteo-engineering/introduction-to-property-based-testing-f5236229d237



const clone = (object) => _.cloneDeep(object);

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

const simple_loop = 
{
  "id": "process3",
  "nodes": [
    { "id": "StartEvent_1", "org": "Process_1", "type": 0 , "vars": [] },
    { "id": "t2", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "pg1", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "t3", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t4", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t5", "org": "Process_1", "type": 2 , "vars": ["param"] },
    { "id": "EndEvent_0kgr2jc", "org": "Process_1", "type": 1 , "vars": [] },
    { "id": "pg2", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "eg1", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "eg2", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "t1", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t6", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t7", "org": "Process_1", "type": 2 , "vars": [] }
  ],
  "edges": [
    { "id": "SequenceFlow_0i3p0yz", "inode": "t2", "onode": "pg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1g5p0px", "inode": "pg1", "onode": "t3", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_085lrjj", "inode": "t3", "onode": "pg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1vb27l4", "inode": "pg1", "onode": "t4", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1sos7ma", "inode": "t4", "onode": "pg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0clnvs1", "inode": "pg2", "onode": "t5", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_05jrnad", "inode": "eg1", "onode": "t2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_01mcb9r", "inode": "t5", "onode": "eg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0waau3y", "inode": "StartEvent_1", "onode": "t1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0q401mi", "inode": "t1", "onode": "eg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0dt7jpb", "inode": "t6", "onode": "EndEvent_0kgr2jc", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1tetzug", "inode": "t7", "onode": "eg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0sogime", "inode": "eg2", "onode": "t6", "travelled": false, "condition": "param == 0" },
    { "id": "SequenceFlow_1shhldh", "inode": "eg2", "onode": "t7", "travelled": false, "condition": "param == 1" }
  ],
  "variables": [{ "name": "param", "value": null }]
}

const simple_loop_final = 
{
  "id": "process3",
  "nodes": [
    { "id": "StartEvent_1", "org": "Process_1", "type": 0, "vars": []},
    { "id": "t2", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "pg1", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "t3", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t4", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t5", "org": "Process_1", "type": 2, "vars": ['param'] },
    { "id": "EndEvent_0kgr2jc", "org": "Process_1", "type": 1 , "vars": [] },
    { "id": "pg2", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "eg1", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "eg2", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "t1", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t6", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t7", "org": "Process_1", "type": 2 , "vars": [] }
  ],
  "edges": [
    { "id": "SequenceFlow_0i3p0yz", "inode": "t2", "onode": "pg1", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_1g5p0px", "inode": "pg1", "onode": "t3", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_085lrjj", "inode": "t3", "onode": "pg2", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_1vb27l4", "inode": "pg1", "onode": "t4", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_1sos7ma", "inode": "t4", "onode": "pg2", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0clnvs1", "inode": "pg2", "onode": "t5", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_05jrnad", "inode": "eg1", "onode": "t2", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_01mcb9r", "inode": "t5", "onode": "eg2", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0waau3y", "inode": "StartEvent_1", "onode": "t1", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0q401mi", "inode": "t1", "onode": "eg1", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0dt7jpb", "inode": "t6", "onode": "EndEvent_0kgr2jc", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_1tetzug", "inode": "t7", "onode": "eg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0sogime", "inode": "eg2", "onode": "t6", "travelled": true, "condition": "param == 0" },
    { "id": "SequenceFlow_1shhldh", "inode": "eg2", "onode": "t7", "travelled": false, "condition": "param == 1" }
  ],
  "variables": [{ "name": "param", "value": '0' }]
}

const simple_loop_final_just_cleared = 
{
  "id": "process3",
  "nodes": [
    { "id": "StartEvent_1", "org": "Process_1", "type": 0 , "vars": [] },
    { "id": "t2", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "pg1", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "t3", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t4", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t5", "org": "Process_1", "type": 2 , "vars": ['param'] },
    { "id": "EndEvent_0kgr2jc", "org": "Process_1", "type": 1 , "vars": [] },
    { "id": "pg2", "org": "Process_1", "type": 4 , "vars": [] },
    { "id": "eg1", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "eg2", "org": "Process_1", "type": 3 , "vars": [] },
    { "id": "t1", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t6", "org": "Process_1", "type": 2 , "vars": [] },
    { "id": "t7", "org": "Process_1", "type": 2 , "vars": [] }
  ],
  "edges": [
    { "id": "SequenceFlow_0i3p0yz", "inode": "t2", "onode": "pg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1g5p0px", "inode": "pg1", "onode": "t3", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_085lrjj", "inode": "t3", "onode": "pg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1vb27l4", "inode": "pg1", "onode": "t4", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1sos7ma", "inode": "t4", "onode": "pg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0clnvs1", "inode": "pg2", "onode": "t5", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_05jrnad", "inode": "eg1", "onode": "t2", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_01mcb9r", "inode": "t5", "onode": "eg2", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0waau3y", "inode": "StartEvent_1", "onode": "t1", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0q401mi", "inode": "t1", "onode": "eg1", "travelled": true, "condition": "" },
    { "id": "SequenceFlow_0dt7jpb", "inode": "t6", "onode": "EndEvent_0kgr2jc", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_1tetzug", "inode": "t7", "onode": "eg1", "travelled": false, "condition": "" },
    { "id": "SequenceFlow_0sogime", "inode": "eg2", "onode": "t6", "travelled": false, "condition": "param == 0" },
    { "id": "SequenceFlow_1shhldh", "inode": "eg2", "onode": "t7", "travelled": false, "condition": "param == 1" }
  ],
  "variables": [{ "name": "param", "value": '1' }]
}
describe('Simple Loop tests', () => {
	test('parallel gateways without loop', () => {
		const startEvent = travel(clone(simple_loop), { id: "StartEvent_1", org: "Process_1", type: 0 , "vars": [] }, []);
		const t1 = travel(clone(startEvent), { id: "t1", org: "Process_1", type: 2 , "vars": [] }, []);
		const t2 = travel(clone(t1), { id: "t2", org: "Process_1", type: 2 , "vars": [] }, []);
		const t3 = travel(clone(t2), { id: "t3", org: "Process_1", type: 2 , "vars": [] }, []);
		const t4 = travel(clone(t3), { id: "t4", org: "Process_1", type: 2 , "vars": [] }, []);
		const t5 = travel(clone(t4), { id: "t5", org: "Process_1", type: 2 , "vars": [] }, [{name: 'param', value: '0'}]);
		const t6 = travel(clone(t5), { id: "t6", org: "Process_1", type: 2 , "vars": [] }, []);
		expect(t6).toStrictEqual(simple_loop_final);
	})

	test('loop behaves correctly', () => {
		const startEvent = travel(clone(simple_loop), { id: "StartEvent_1", org: "Process_1", type: 0 , "vars": [] }, []);
		const t1 = travel(clone(startEvent), { id: "t1", org: "Process_1", type: 2 , "vars": [] }, []);
		const t2 = travel(clone(t1), { id: "t2", org: "Process_1", type: 2 , "vars": [] }, []);
		const t3 = travel(clone(t2), { id: "t3", org: "Process_1", type: 2 , "vars": [] }, []);
		const t4 = travel(clone(t3), { id: "t4", org: "Process_1", type: 2 , "vars": [] }, []);
		const t5 = travel(clone(t4), { id: "t5", org: "Process_1", type: 2 , "vars": [] }, [{name: 'param', value: '1'}]);
		const t7 = travel(clone(t5), { id: "t7", org: "Process_1", type: 2 , "vars": [] }, []);
		expect(t7).toStrictEqual(simple_loop_final_just_cleared);
		console.log(t5);
		const t2_2 = travel(clone(t7), { id: "t2", org: "Process_1", type: 2 , "vars": [] }, []);
		const t3_2 = travel(clone(t2_2), { id: "t3", org: "Process_1", type: 2 , "vars": [] }, []);
		const t4_2 = travel(clone(t3_2), { id: "t4", org: "Process_1", type: 2 , "vars": [] }, []);
		const t5_2 = travel(clone(t4_2), { id: "t5", org: "Process_1", type: 2 , "vars": [] }, [{name: 'param', value: '0'}]);
		const t6 = travel(clone(t5_2), { id: "t6", org: "Process_1", type: 2 , "vars": [] }, []);
		expect(t6).toStrictEqual(simple_loop_final);
	})

});
