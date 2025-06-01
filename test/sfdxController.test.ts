import * as ChildProcess from 'child_process';
import SfdxController from '../src/sfdxController';

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

describe('SfdxController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should build the correct console command with arguments', () => {
        const ctrl = new SfdxController('deploy');
        ctrl.addArgumment('--targetusername', 'testuser');
        ctrl.addArgumment('--json', '');

        expect(ctrl.consoleCommand).toBe('sf deploy --targetusername="testuser" --json');
    });

    it('should build the correct console command with no arguments', () => {
        const ctrl = new SfdxController('deploy');

        expect(ctrl.consoleCommand).toBe('sf deploy');
    });

    it('should add arguments to the command', () => {
        const ctrl = new SfdxController('deploy');
        ctrl.addArgumment('--foo', 'bar');

        expect(ctrl.consoleCommand).toContain('--foo="bar"');
    });
});
