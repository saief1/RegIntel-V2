import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  it('emits canonical error envelope with requestId', () => {
    const filter = new AllExceptionsFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ requestId: 'req-123' }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(
      new HttpException(
        {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Access token has expired.',
        },
        HttpStatus.UNAUTHORIZED,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(401);
    const payload = json.mock.calls[0]?.[0] as {
      success: boolean;
      error: {
        code: string;
        message: string;
        requestId: string;
        timestamp: string;
      };
    };
    expect(payload).toMatchObject({
      success: false,
      error: {
        code: 'AUTH_INVALID_TOKEN',
        message: 'Access token has expired.',
        requestId: 'req-123',
      },
    });
    expect(typeof payload.error.timestamp).toBe('string');
  });
});
