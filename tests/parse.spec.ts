import { parseBpmn } from '../src/parser';
import { Edge, EdgeType, Node, Process } from '../src/types';
import * as fs from 'fs';

// https://medium.com/criteo-engineering/introduction-to-property-based-testing-f5236229d237

describe('Testing parser', () => {
	const filename = './example_bpmns/01_simple_choice.bpmn';
	const filename2 = './example_bpmns/04_incident_management.bpmn';
	const filename3 = './example_bpmns/03_simple_loop.bpmn';
	/* const simple_choice : Process = parseBpmn(filename, 'process1'); */
	/* const incident_management : Process = parseBpmn(filename2, 'process2'); */
	const simple_loop : Process = parseBpmn(filename3, 'process3');

  fs.writeFileSync('./output.json', JSON.stringify(simple_loop), { encoding: 'utf8', flag: 'w' });

});
