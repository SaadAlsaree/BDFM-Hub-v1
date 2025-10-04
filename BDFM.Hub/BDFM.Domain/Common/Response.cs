

namespace BDFM.Domain.Common;
public class Response<T>
{
    public bool Succeeded { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<object> Errors { get; set; } = new List<object>();
    public string Code { get; set; } = string.Empty;

    public Response() { }
    public Response(T data, MessageResponse message)
    {
        Succeeded = true;
        Data = data;
        Message = message.Message;
        Code = message.Code;
    }

    public Response(MessageResponse message)
    {
        Succeeded = false;
        Message = message.Message;
        Code = message.Code;
    }
    public static Response<T> Success()
    {
        var result = new Response<T> { Succeeded = true };
        return result;
    }
    public static Response<T> Success(MessageResponse message)
    {
        var result = new Response<T> { Succeeded = true, Message = message.Message, Code = message.Code };
        return result;
    }

    public static Response<T> Success(T data, MessageResponse message)
    {
        var result = new Response<T> { Succeeded = true, Data = data, Message = message.Message, Code = message.Code };
        return result;
    }
    public static Response<T> Success(T data)
    {
        var result = new Response<T> { Succeeded = true, Data = data, Message = "Succeeded" };
        return result;
    }

    public static Response<T> Fail()
    {
        var result = new Response<T> { Succeeded = false };
        return result;
    }
    public static Response<T> Fail(MessageResponse message)
    {
        var result = new Response<T> { Succeeded = false, Message = message.Message, Code = message.Code };
        return result;
    }

    public static Response<T> Fail(T data, MessageResponse message)
    {
        var result = new Response<T> { Succeeded = false, Data = data, Message = message.Message, Code = message.Code };
        return result;
    }

    public static Response<T> Fail(List<object> errors, MessageResponse message)
    {
        var result = new Response<T> { Succeeded = false, Errors = errors, Message = message.Message, Code = message.Code };
        return result;
    }

}