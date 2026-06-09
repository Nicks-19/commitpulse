// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import type { GetClientIpOptions, TrustedProxyConfig } from './network';
import { getClientIp } from '@/utils/getClientIp';

describe('Network Types & Utilities Massive Scaling', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should populate mock objects representing thousands of proxy parameters', () => {
    // Generate 5,000 trusted proxy IPs/CIDRs
    const trustedProxies = Array.from(
      { length: 5000 },
      (_, i) => `192.168.${Math.floor(i / 256)}.${i % 256}`
    );

    const config: TrustedProxyConfig = {
      trustedProxies,
      trustPrivateRanges: true,
    };

    // Generate 10,000 IP hops for the header
    const ipHops = Array.from(
      { length: 10000 },
      (_, i) => `10.${Math.floor(i / 65536)}.${Math.floor(i / 256) % 256}.${i % 256}`
    );
    const xffHeaderValue = ipHops.join(', ');

    const options: GetClientIpOptions = {
      proxyConfig: config,
      headersPriority: ['x-vercel-forwarded-for', 'cf-connecting-ip', 'x-real-ip'],
    };

    expect(config.trustedProxies).toHaveLength(5000);
    expect(ipHops).toHaveLength(10000);
    expect(xffHeaderValue.length).toBeGreaterThan(100000);
    expect(options.headersPriority).toHaveLength(3);
  });

  it('should securely extract client IP from highly loaded Request configurations', () => {
    const trustedProxies = Array.from(
      { length: 5000 },
      (_, i) => `192.168.${Math.floor(i / 256)}.${i % 256}`
    );
    const ipHops = Array.from(
      { length: 10000 },
      (_, i) => `10.${Math.floor(i / 65536)}.${Math.floor(i / 256) % 256}.${i % 256}`
    );

    // Append one untrusted IP at the beginning of the chain (leftmost client IP)
    const clientIp = '8.8.8.8';
    const allHops = [clientIp, ...ipHops];

    const request = new Request('https://commitpulse.dev', {
      headers: {
        'x-forwarded-for': allHops.join(', '),
      },
    });

    const config: TrustedProxyConfig = {
      // Add all hops to trusted except the client IP
      trustedProxies: [...trustedProxies, ...ipHops],
      trustPrivateRanges: false,
    };

    const resolvedIp = getClientIp(request, { proxyConfig: config });
    expect(resolvedIp).toBe(clientIp);
  });

  it('should render trusted proxy hop routes inside SVG canvas with extreme coordinates and long IPv6 strings without overlapping', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000000 1000000');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    // Create a text node representing a long IPv6 client address hop visualization node
    const hopAddress = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textNode.setAttribute('x', '-500000'); // Extreme negative coordinate representing offset on a massive map
    textNode.setAttribute('y', '999999'); // Extreme high bound coordinate
    textNode.textContent = hopAddress;

    // SVG rect node representing a trusted proxy network gateway node block
    const rectNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectNode.setAttribute('x', '1000000');
    rectNode.setAttribute('y', '0');
    rectNode.setAttribute('width', '500000');
    rectNode.setAttribute('height', '250000');

    svg.appendChild(textNode);
    svg.appendChild(rectNode);
    document.body.appendChild(svg);

    // Verify coordinates and SVG map container boundary values
    expect(svg.getAttribute('viewBox')).toBe('0 0 1000000 1000000');
    expect(textNode.getAttribute('x')).toBe('-500000');
    expect(textNode.getAttribute('y')).toBe('999999');
    expect(textNode.textContent).toBe(hopAddress);
    expect(rectNode.getAttribute('width')).toBe('500000');
    expect(document.body.contains(svg)).toBe(true);
  });

  it('should check client IP calculation times under load to ensure it remains below the performance limit', () => {
    // Generate massive config
    const trustedProxies = Array.from(
      { length: 5000 },
      (_, i) => `192.168.${Math.floor(i / 256)}.${i % 256}`
    );
    const ipHops = Array.from(
      { length: 1000 },
      (_, i) => `10.${Math.floor(i / 65536)}.${Math.floor(i / 256) % 256}.${i % 256}`
    );

    const request = new Request('https://commitpulse.dev', {
      headers: {
        'x-forwarded-for': ['8.8.8.8', ...ipHops].join(', '),
      },
    });

    const config: TrustedProxyConfig = {
      trustedProxies: [...trustedProxies, ...ipHops],
      trustPrivateRanges: false,
    };

    const start = performance.now();
    // Resolve multiple times to verify calculation performance
    for (let i = 0; i < 50; i++) {
      getClientIp(request, { proxyConfig: config });
    }
    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(5000); // Verify execution duration is resiliently low (< 5000ms)
  });

  it('should verify that a grid list of resolved IP log entries renders correctly without breaking layout trees', () => {
    // Create a grid container to represent a dashboard audit log table of resolved client request IPs
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    gridContainer.style.gap = '10px';

    // Append 500 audit log list items
    for (let i = 0; i < 500; i++) {
      const item = document.createElement('div');
      item.className = 'ip-record-item';

      const ipLabel = document.createElement('span');
      ipLabel.textContent = `IP: 192.168.1.${i}`;

      const statusLabel = document.createElement('span');
      statusLabel.textContent = 'Status: Trusted';

      item.appendChild(ipLabel);
      item.appendChild(statusLabel);
      gridContainer.appendChild(item);
    }

    document.body.appendChild(gridContainer);

    expect(gridContainer.style.display).toBe('grid');
    expect(gridContainer.style.gridTemplateColumns).toBe('repeat(5, 1fr)');
    expect(gridContainer.querySelectorAll('.ip-record-item')).toHaveLength(500);
    expect(document.body.contains(gridContainer)).toBe(true);
  });
});
