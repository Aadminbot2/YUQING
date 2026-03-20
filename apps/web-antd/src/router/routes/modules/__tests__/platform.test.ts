import { describe, expect, it } from 'vitest';
import platformRoutes from '../platform';

describe('Platform Routes', () => {
  it('should have correct top-level route configuration', () => {
    expect(platformRoutes).toBeDefined();
    expect(platformRoutes.length).toBe(1);

    const platformRoute = platformRoutes[0];
    expect(platformRoute?.name).toBe('Platform');
    expect(platformRoute?.path).toBe('/platform');
    expect(platformRoute?.meta?.title).toBe('全部平台');
  });

  it('should have 6 platform sub-routes', () => {
    const platformRoute = platformRoutes[0];
    const children = platformRoute?.children || [];
    expect(children.length).toBe(6);

    const routeNames = children.map(route => route.name);
    expect(routeNames).toContain('DouyinPlatform');
    expect(routeNames).toContain('KuaishouPlatform');
    expect(routeNames).toContain('XiaohongshuPlatform');
    expect(routeNames).toContain('ZhihuPlatform');
    expect(routeNames).toContain('BilibiliPlatform');
    expect(routeNames).toContain('WeiboPlatform');
  });

  it('should map routes to correct components and metadata', () => {
    const platformRoute = platformRoutes[0];
    const children = platformRoute?.children || [];

    const douyin = children.find(r => r.name === 'DouyinPlatform');
    expect(douyin?.path).toBe('/platform/douyin');
    expect(douyin?.meta?.title).toBe('抖音');
    expect(typeof douyin?.component).toBe('function');
  });
});
