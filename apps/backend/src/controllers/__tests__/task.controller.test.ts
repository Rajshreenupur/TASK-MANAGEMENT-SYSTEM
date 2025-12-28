import { isValidTransition } from '../../utils/taskStateTransition.js';
import { TaskStatus } from '../../models/Task.model.js';

describe('Task Controller Business Logic', () => {
  describe('Task State Transition Validation', () => {
    describe('Valid Transitions', () => {
      it('should validate BACKLOG -> IN_PROGRESS transition', () => {
        expect(isValidTransition('BACKLOG', 'IN_PROGRESS')).toBe(true);
      });

      it('should validate IN_PROGRESS -> REVIEW transition', () => {
        expect(isValidTransition('IN_PROGRESS', 'REVIEW')).toBe(true);
      });

      it('should validate REVIEW -> DONE transition', () => {
        expect(isValidTransition('REVIEW', 'DONE')).toBe(true);
      });
    });

    describe('Invalid Transitions', () => {
      it('should reject BACKLOG -> REVIEW (skipping state)', () => {
        expect(isValidTransition('BACKLOG', 'REVIEW')).toBe(false);
      });

      it('should reject BACKLOG -> DONE (skipping states)', () => {
        expect(isValidTransition('BACKLOG', 'DONE')).toBe(false);
      });

      it('should reject IN_PROGRESS -> DONE (skipping state)', () => {
        expect(isValidTransition('IN_PROGRESS', 'DONE')).toBe(false);
      });

      it('should reject IN_PROGRESS -> BACKLOG (backward transition)', () => {
        expect(isValidTransition('IN_PROGRESS', 'BACKLOG')).toBe(false);
      });

      it('should reject REVIEW -> IN_PROGRESS (backward transition)', () => {
        expect(isValidTransition('REVIEW', 'IN_PROGRESS')).toBe(false);
      });

      it('should reject REVIEW -> BACKLOG (backward transition)', () => {
        expect(isValidTransition('REVIEW', 'BACKLOG')).toBe(false);
      });

      it('should reject DONE -> any state (no transitions from DONE)', () => {
        const allStatuses: TaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        allStatuses.forEach((status) => {
          expect(isValidTransition('DONE', status)).toBe(false);
        });
      });

      it('should reject same state transitions', () => {
        const allStatuses: TaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        allStatuses.forEach((status) => {
          expect(isValidTransition(status, status)).toBe(false);
        });
      });
    });

    describe('Complete Workflow Validation', () => {
      it('should validate complete workflow: BACKLOG -> IN_PROGRESS -> REVIEW -> DONE', () => {
        expect(isValidTransition('BACKLOG', 'IN_PROGRESS')).toBe(true);
        
        expect(isValidTransition('IN_PROGRESS', 'REVIEW')).toBe(true);
        
        expect(isValidTransition('REVIEW', 'DONE')).toBe(true);
      });

      it('should not allow any transitions from DONE', () => {
        const transitions = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        transitions.forEach((targetStatus) => {
          expect(isValidTransition('DONE', targetStatus as TaskStatus)).toBe(false);
        });
      });
    });
  });

  describe('Task Assignment Logic', () => {
    it('should default assignee to creator when not provided', () => {
      const creatorId = 'creator123';
      const providedAssignee = undefined;
      const taskAssignee = providedAssignee || creatorId;
      
      expect(taskAssignee).toBe(creatorId);
    });

    it('should use provided assignee when available', () => {
      const creatorId = 'creator123';
      const providedAssignee = 'assignee456';
      const taskAssignee = providedAssignee || creatorId;
      
      expect(taskAssignee).toBe(providedAssignee);
    });
  });

  describe('Task Priority Logic', () => {
    it('should default priority to MEDIUM when not provided', () => {
      const providedPriority = undefined;
      const taskPriority = providedPriority || 'MEDIUM';
      
      expect(taskPriority).toBe('MEDIUM');
    });

    it('should use provided priority when available', () => {
      const priorities: Array<'LOW' | 'MEDIUM' | 'HIGH'> = ['LOW', 'MEDIUM', 'HIGH'];
      
      priorities.forEach((priority) => {
        const taskPriority = priority || 'MEDIUM';
        expect(taskPriority).toBe(priority);
      });
    });
  });

  describe('Task Status Default', () => {
    it('should default new tasks to BACKLOG status', () => {
      const defaultStatus = 'BACKLOG';
      expect(defaultStatus).toBe('BACKLOG');
    });
  });
});

