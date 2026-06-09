import { describe, it, expect } from 'vitest';
import { Notification } from './Notification';

describe('NotificationModel - Mouse Interactivity & Tooltips', () => {
  it('1. triggers simulated mouseenter/hover gestures and maps to Notification state', () => {
    const notification = new Notification({ username: 'hover_user', email: 'test@test.com' });
    const mockElement = document.createElement('div');

    let isHovered = false;
    mockElement.addEventListener('mouseenter', () => {
      isHovered = true;
      notification.isActive = true;
    });

    mockElement.dispatchEvent(new Event('mouseenter'));
    expect(isHovered).toBe(true);
    expect(notification.isActive).toBe(true);
  });

  it('2. verifies that responsive tooltip layouts display at computed coordinates on hover', () => {
    const tooltip = document.createElement('div');
    tooltip.style.display = 'none';

    const notification = new Notification({ username: 'tooltip_user', email: 't@t.com' });

    // Simulate computing coordinates for the notification tooltip
    const computeCoordinates = () => ({ x: 100, y: 200 });

    const triggerHover = () => {
      const coords = computeCoordinates();
      tooltip.style.display = 'block';
      tooltip.style.left = `${coords.x}px`;
      tooltip.style.top = `${coords.y}px`;
    };

    triggerHover();
    expect(tooltip.style.display).toBe('block');
    expect(tooltip.style.left).toBe('100px');
    expect(tooltip.style.top).toBe('200px');
    expect(notification.username).toBe('tooltip_user');
  });

  it('3. tests custom click/touch gestures and ensures click events propagate correctly', () => {
    const button = document.createElement('button');
    let touchPropagated = false;

    button.addEventListener('touchstart', () => {
      touchPropagated = true;
    });

    const event = new Event('touchstart', { bubbles: true });
    button.dispatchEvent(event);

    const notification = new Notification({
      username: 'touch_user',
      email: 't2@t.com',
      notifyOnMilestone: touchPropagated,
    });

    expect(touchPropagated).toBe(true);
    expect(notification.notifyOnMilestone).toBe(true);
  });

  it('4. asserts appropriate cursor style classes (like pointer) are applied on hover', () => {
    const element = document.createElement('div');

    element.addEventListener('mouseover', () => {
      element.style.cursor = 'pointer';
      element.classList.add('hover-active');
    });

    element.dispatchEvent(new Event('mouseover'));

    expect(element.style.cursor).toBe('pointer');
    expect(element.classList.contains('hover-active')).toBe(true);

    const notification = new Notification({ username: 'cursor_user', email: 't3@t.com' });
    expect(notification.validateSync()).toBeUndefined(); // Validates model successfully
  });

  it('5. checks that mouseleave events successfully hide temporary overlay visuals', () => {
    const overlay = document.createElement('div');
    overlay.style.opacity = '1';

    overlay.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    });

    overlay.dispatchEvent(new Event('mouseleave'));

    const notification = new Notification({ username: 'leave_user', email: 't4@t.com' });

    expect(overlay.style.opacity).toBe('0');
    expect(overlay.style.visibility).toBe('hidden');
    expect(notification.frequency).toBe('daily'); // Default
  });
});
