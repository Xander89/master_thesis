#version 430
in vec3 _tex;

uniform sampler2DArray colorMap;
uniform sampler2DArray vtex;
uniform sampler2DArray ntex;
uniform sampler2DArrayShadow depthMap;
uniform sampler2D discpoints;

out vec4 fragColor;
uniform float mipmap_LOD;

#include "ss_aincludes_constants.glinc"
#include "ss_aincludes_ss_uniforms.glinc"

#include "ss_aincludes_optics.glinc"

#include "ss_aincludes_directional_bssrdf_opt.glinc"


#include "ss_aincludes_random.glinc"

void main(void)
{
    int level = 1;
    fragColor = vec4(0);

    vec3 xi = vec3(1,1,0);
    vec3 xo = vec3(2 * _tex.xy,0);
    vec3 ni = vec3(0,0,1);
    vec3 no = vec3(0,0,1);
    vec3 wi = normalize(vec3(0,0,1));
   //fragColor = vec4(bssrdf(xi,ni,wi,xo,no),1.0f) / 1;
    //fragColor = pow(fragColor,vec4(1/2.2f));

        fragColor = textureLod(colorMap,vec3(_tex.xy, 0),mipmap_LOD).xyzz;
        fragColor = texture(depthMap,vec4(_tex.xy, 0, 0.5)).xxxx;// + textureLod(colorMap,vec3(_tex.xy,level),1f);
        fragColor = noise(gl_FragCoord.xy).xxxx;

       fragColor = LCG(int(gl_FragCoord.x + 1024 * gl_FragCoord.y)).xxxx;

    fragColor = (texture(vtex, vec3(_tex.xy,1)));
    //if(fragColor.z > 100)
    //    fragColor = vec4(0);
    //fragColor = vec4(0.0,0.0,1.0f,1.0);
   // fragColor = vec4(1.0);

}
