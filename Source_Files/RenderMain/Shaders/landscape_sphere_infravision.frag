R"(

uniform sampler2D texture0;
uniform float fogMix;
varying vec3 relDir;
varying vec4 vertexColor;
varying float cosPitch;
varying float sinPitch;
varying float cosYaw;
varying float sinYaw;
uniform float offsetx; // azimuth in the sphere map
const float M_PI = 3.14156;

vec4 texture2DNearAA(sampler2D tex, vec2 p) {
	vec2 texture_size = vec2(textureSize(tex, 0));
	vec2 texel_size = vec2(1.0, 1.0) / texture_size;
	vec2 p_width = fwidth(p);
	vec2 box_size = clamp(p_width * texture_size, 1e-5, 1.0);
	vec2 texel = p * texture_size;
	vec2 texel_offset = clamp((fract(texel) - (1.0 - box_size)) / box_size, 0.0, 1.0);
	vec2 uv = (floor(texel) + 0.5 + texel_offset) * texel_size;
	return texture2D(tex, uv);
}

void main(void) {
	mat3 rotateYaw = mat3(cosYaw, 0, sinYaw,
						  0, 1, 0,
						  -sinYaw, 0, cosYaw);

	mat3 rotatePitch = mat3(1, 0, 0,
							0, cosPitch, -sinPitch,
							0, sinPitch, cosPitch);

	vec3 normRelDir = rotateYaw * rotatePitch * normalize(relDir);
	
	float theta = atan(normRelDir.x, normRelDir.z) - offsetx;
	float phi = acos(normRelDir.y);

	float u = (M_PI - theta) / (2.0 * M_PI);
	float v = phi / M_PI;

	vec4 color = texture2DNearAA(texture0, vec2(u, v));
    float avg = (color.r + color.g + color.b) / 3.0;
	vec3 intensity = mix(vertexColor.rgb * avg, gl_Fog.color.rgb, fogMix);
	gl_FragColor = vec4(intensity, 1.0);
}

)"
