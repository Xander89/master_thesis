#version 430
in vec3 vertex;

out vec3 v_tex;

void main()
{
    v_tex = vec3(vertex.x * 0.5 + 0.5,vertex.y * 0.5 + 0.5,0.0f);
    gl_Position = vec4(vertex.xy,0,1);
}
