#version 430
#define RANDOM
#define TIME
#define MULTI_LIGHTS
//#define OVERLAY
#define SPECTRAL

layout(location = 0) out vec4 fragColor;

#include "ss_aincludes_constants.glinc"

uniform sampler2DArray ntex;
uniform sampler2DArray vtex;
uniform sampler2D discpoints;

#ifdef TIME
uniform sampler2DArray colorMap;
#endif

smooth in vec3 position;
smooth in vec3 norm;

uniform vec4 light_pos[MAX_LIGHTS];
uniform vec4 light_diff[MAX_LIGHTS];
uniform int light_number;
uniform mat4 lightMatrices[MAX_LIGHTS];

uniform float one_over_max_samples;
uniform float one_over_discs;
uniform float min_tr;
uniform float max_samples;
#ifdef TIME
uniform int convergence_frames;
uniform float current_frame_percentage;
uniform mat4 cameraMatrices[DIRECTIONS];
uniform int global_frame;
uniform int current_frame;

#endif

uniform float discradius;
uniform int samples;

#include "ss_aincludes_ss_uniforms.glinc"

#include "ss_aincludes_optics.glinc"

#include "ss_aincludes_directional_bssrdf_opt.glinc"

#include "ss_aincludes_random.glinc"

void main(void)
{


    int layer = gl_Layer;
    vec3 xo = position;
    vec3 no = normalize(norm);

#ifdef TIME
    vec4 l = cameraMatrices[layer] * vec4(position,1.0f);

    vec4 oldColor = (current_frame > 0)? texture(colorMap,vec3(l.xy,layer)) : vec4(0.0f) ;
#else
    vec4 oldColor = vec4(0.0f);
#endif

    vec3 accumulate = vec3(0.0f);

#ifdef TIME
    float time = current_frame_percentage;
#else
    float time = 0;
#endif


#ifdef RANDOM
    float noise = noise(layer * gl_FragCoord.xy);//LFSR_Rand_Gen(layer * int(gl_FragCoord.x + ARRAY_TEX_SIZE * gl_FragCoord.y));

    float r_angle = (noise + time) * 2 * M_PI;
    //float delta_rad = discradius * one_over_max_samples * (noise - 0.5f);
    float c = cos(r_angle);
    float s = sin(r_angle);
    mat2 rotation_matrix = mat2(c,s,-s,c);
#endif

#ifdef OVERLAY
    bool color  = false;
#endif



    for(int k = 0; k < light_number; k++)
    {
        int count = 0;
        int current_light = k;
        vec3 wi = light_pos[current_light].xyz;
        vec4 rad = light_diff[current_light];
        vec3 topoint = wi - xo;
        float light_type = 1;
        wi = (light_type > 0)? normalize(topoint) : normalize(wi);
        vec3 Li = light_diff[current_light].xyz;
        Li = (light_type > 0)? Li / dot(topoint,topoint) : Li;

        //vec3 offset = epsilon_gbuffer * (no - wi * dot(no,wi));
        //vec3 position_mod = xo;
        //vec3 position_mod = xo - epsilon * (1 - dot(no,wi)) * no;

        vec4 light_post = lightMatrices[k] * vec4(xo,1.0f);
        vec2 circle_center = light_post.xy;

        for(int i = 0; i < max_samples && count < samples; i++)
        {
            vec2 smpl = texture(discpoints,vec2((i) * one_over_max_samples, layer * one_over_discs)).xy;
            vec2 relative_point = discradius * smpl;

    #ifdef RANDOM
            vec2 discoffset = rotation_matrix * relative_point;
    #else
            vec2 discoffset = relative_point;
    #endif
            vec2 uvin = circle_center + discoffset;
            vec3 sampl = vec3(uvin, k);

            if(uvin.x >= 0.0f && uvin.x <= 1.0f && uvin.y >= 0.0f && uvin.y <= 1.0f)
            {
                vec3 xi = texture(vtex, sampl).rgb;
                //if(xi.z > -990.0f)
                {
                    vec3 ni = texture(ntex, sampl).rgb;
                    vec3 S = bssrdf(xi,wi,ni,xo,no);
                    float normalization = exp(min_tr * length(relative_point));
                    accumulate += Li * S * normalization;
                    count += 1;
                }

            }
            #ifdef OVERLAY
                if(length(discradius * smpl + vec2(0.5) - gl_FragCoord.xy / 1024) < 5.f/1024)
                    color = true;
            #endif
        }

    }
#ifdef OVERLAY
    if(color)
        fragColor = vec4(1,0,0,0);
    else
        fragColor = vec4(1);
#else
        fragColor = vec4(accumulate,noise) + vec4(oldColor.xyz,0);
#endif


}