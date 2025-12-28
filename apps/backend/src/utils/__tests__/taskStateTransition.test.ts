import { isValidTransition, getValidTransitions } from '../taskStateTransition.js';
import { TaskStatus } from '../../models/Task.model.js';

describe('Task State Transitions', () => {
  describe('isValidTransition', () => {
    it('should allow BACKLOG to IN_PROGRESS', () => {
      expect(isValidTransition('BACKLOG', 'IN_PROGRESS')).toBe(true);
    });

    it('should not allow BACKLOG to REVIEW', () => {
      expect(isValidTransition('BACKLOG', 'REVIEW')).toBe(false);
    });

    it('should not allow BACKLOG to DONE', () => {
      expect(isValidTransition('BACKLOG', 'DONE')).toBe(false);
    });

    it('should not allow BACKLOG to BACKLOG (same state)', () => {
      expect(isValidTransition('BACKLOG', 'BACKLOG')).toBe(false);
    });

    it('should allow IN_PROGRESS to REVIEW', () => {
      expect(isValidTransition('IN_PROGRESS', 'REVIEW')).toBe(true);
    });

    it('should not allow IN_PROGRESS to BACKLOG', () => {
      expect(isValidTransition('IN_PROGRESS', 'BACKLOG')).toBe(false);
    });

    it('should not allow IN_PROGRESS to DONE', () => {
      expect(isValidTransition('IN_PROGRESS', 'DONE')).toBe(false);
    });

    it('should not allow IN_PROGRESS to IN_PROGRESS (same state)', () => {
      expect(isValidTransition('IN_PROGRESS', 'IN_PROGRESS')).toBe(false);
    });

    it('should allow REVIEW to DONE', () => {
      expect(isValidTransition('REVIEW', 'DONE')).toBe(true);
    });

    it('should not allow REVIEW to BACKLOG', () => {
      expect(isValidTransition('REVIEW', 'BACKLOG')).toBe(false);
    });

    it('should not allow REVIEW to IN_PROGRESS', () => {
      expect(isValidTransition('REVIEW', 'IN_PROGRESS')).toBe(false);
    });

    it('should not allow REVIEW to REVIEW (same state)', () => {
      expect(isValidTransition('REVIEW', 'REVIEW')).toBe(false);
    });

    it('should not allow DONE to any state', () => {
      expect(isValidTransition('DONE', 'BACKLOG')).toBe(false);
      expect(isValidTransition('DONE', 'IN_PROGRESS')).toBe(false);
      expect(isValidTransition('DONE', 'REVIEW')).toBe(false);
      expect(isValidTransition('DONE', 'DONE')).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return IN_PROGRESS for BACKLOG', () => {
      const transitions = getValidTransitions('BACKLOG');
      expect(transitions).toEqual(['IN_PROGRESS']);
      expect(transitions.length).toBe(1);
    });

    it('should return REVIEW for IN_PROGRESS', () => {
      const transitions = getValidTransitions('IN_PROGRESS');
      expect(transitions).toEqual(['REVIEW']);
      expect(transitions.length).toBe(1);
    });

    it('should return DONE for REVIEW', () => {
      const transitions = getValidTransitions('REVIEW');
      expect(transitions).toEqual(['DONE']);
      expect(transitions.length).toBe(1);
    });

    it('should return empty array for DONE', () => {
      const transitions = getValidTransitions('DONE');
      expect(transitions).toEqual([]);
      expect(transitions.length).toBe(0);
    });

    it('should handle all valid status values', () => {
      const allStatuses: TaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      
      allStatuses.forEach((status) => {
        const transitions = getValidTransitions(status);
        expect(Array.isArray(transitions)).toBe(true);
      });
    });
  });

  describe('State Transition Flow', () => {
    it('should follow the correct flow: BACKLOG -> IN_PROGRESS -> REVIEW -> DONE', () => {
      expect(isValidTransition('BACKLOG', 'IN_PROGRESS')).toBe(true);
      
      expect(isValidTransition('IN_PROGRESS', 'REVIEW')).toBe(true);
      
      expect(isValidTransition('REVIEW', 'DONE')).toBe(true);
    });

    it('should not allow skipping states', () => {
      expect(isValidTransition('BACKLOG', 'REVIEW')).toBe(false);
      
      expect(isValidTransition('BACKLOG', 'DONE')).toBe(false);
      
      expect(isValidTransition('IN_PROGRESS', 'DONE')).toBe(false);
    });

    it('should not allow backward transitions', () => {
      expect(isValidTransition('IN_PROGRESS', 'BACKLOG')).toBe(false);
      
      expect(isValidTransition('REVIEW', 'IN_PROGRESS')).toBe(false);
      
      expect(isValidTransition('REVIEW', 'BACKLOG')).toBe(false);
      
      expect(isValidTransition('DONE', 'REVIEW')).toBe(false);
      expect(isValidTransition('DONE', 'IN_PROGRESS')).toBe(false);
      expect(isValidTransition('DONE', 'BACKLOG')).toBe(false);
    });
  });
});

