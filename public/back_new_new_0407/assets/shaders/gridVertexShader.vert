#version 300 es

layout(std140) uniform type_u_EveryFrameVert
{
    layout(row_major) mat4 u_worldViewProjectionMatrix;
} u_EveryFrameVert;

layout(location = 0) in vec3 in_var_POSITION;
layout(location = 1) in vec3 in_var_NORMAL;
layout(location = 2) in vec2 in_var_TEXCOORD0;
layout(location = 3) in vec4 in_var_COLOR0;
out vec2 varying_TEXCOORD0;
out vec2 varying_TEXCOORD1;

void main()
{
    vec4 _44 = vec4(in_var_POSITION, 1.0) * u_EveryFrameVert.u_worldViewProjectionMatrix;
    vec2 _58;
    do
    {
        if (u_EveryFrameVert.u_worldViewProjectionMatrix[3u].y == 0.0)
        {
            _58 = vec2(_44.zw);
            break;
        }
        _58 = vec2(1.0 + _44.w, 0.0);
        break;
    } while(false);
    gl_Position = _44;
    varying_TEXCOORD0 = in_var_TEXCOORD0;
    varying_TEXCOORD1 = _58;
}

