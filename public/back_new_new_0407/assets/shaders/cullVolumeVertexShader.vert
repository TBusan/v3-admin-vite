#version 300 es

layout(std140) uniform type_u_EveryFrameVert
{
    layout(row_major) mat4 u_modelViewMatrix;
    layout(row_major) mat4 u_modelViewProjectionMatrix;
} u_EveryFrameVert;

layout(location = 0) in vec3 in_var_POSITION;
layout(location = 1) in vec3 in_var_NORMAL;
layout(location = 2) in vec2 in_var_TEXCOORD0;
layout(location = 3) in vec4 in_var_COLOR0;
out vec4 varying_TEXCOORD0;
out vec2 varying_TEXCOORD1;
out vec2 varying_TEXCOORD2;

void main()
{
    vec4 _44 = vec4(in_var_POSITION, 1.0);
    vec4 _45 = _44 * u_EveryFrameVert.u_modelViewProjectionMatrix;
    vec2 _59;
    do
    {
        if (u_EveryFrameVert.u_modelViewProjectionMatrix[3u].y == 0.0)
        {
            _59 = vec2(_45.zw);
            break;
        }
        _59 = vec2(1.0 + _45.w, 0.0);
        break;
    } while(false);
    gl_Position = _45;
    varying_TEXCOORD0 = _45;
    varying_TEXCOORD1 = _59;
    varying_TEXCOORD2 = (_44 * u_EveryFrameVert.u_modelViewMatrix).yx;
}

