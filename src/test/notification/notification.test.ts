import { notificationService } from '@services/notification.service';
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as notificationServer from '@root/sockets/notification';
import { notificationQueue } from '@root/queues/notification.queue';
import { authUserPayload } from '../mock/auth.mock';
import { notificationMockRequest, notificationMockResponse, notificationData } from '../mock/notification.mock';
import { notificationController } from '@controllers/notification.controller';

jest.useFakeTimers();
jest.mock('@queues/base.queue');
jest.mock('@services/notification.service');

Object.defineProperties(notificationServer, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true
  }
});

describe('Notification', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response for getNotifications', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([notificationData]);

    await notificationController.getNotifications(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser!.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User notifications',
      notifications: [notificationData]
    });
  });

  it('should send correct json response for updateNotification', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
    jest.spyOn(notificationQueue, 'addNotificationJob');

    await notificationController.updateNotification(req, res);
    expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith('update notification', req.params.notificationId);
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('updateNotification', { key: req.params.notificationId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification marked as read'
    });
  });

  it('should send correct json response for deleteNotification', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
    jest.spyOn(notificationQueue, 'addNotificationJob');

    await notificationController.deleteNotification(req, res);
    expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith('delete notification', req.params.notificationId);
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('deleteNotification', { key: req.params.notificationId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification deleted successfully'
    });
  });
});
