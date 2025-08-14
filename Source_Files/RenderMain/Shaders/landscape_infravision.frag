R"(

uniform sampler2D texture0;
uniform float fogMix;
uniform float scalex;
uniform float scaley;
uniform float offsetx;
uniform float offsety;
uniform float yaw;
uniform float pitch;
varying vec3 relDir;
varying vec4 vertexColor;
const float zoom = 1.2;
const float pitch_adjust = 0.96;

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
	vec3 facev = vec3(cos(yaw), sin(yaw), sin(pitch));
	vec3 relv  = (relDir);
	float x = relv.x / (relv.z * zoom) + atan(facev.x, facev.y);
	float y = relv.y / (relv.z * zoom) - (facev.z * pitch_adjust);
	vec4 color = texture2DNearAA(texture0, vec2(offsetx - x * scalex, offsety - y * scaley));
	float avg = (color.r + color.g + color.b) / 3.0;
	vec3 intensity = mix(vertexColor.rgb * avg, gl_Fog.color.rgb, fogMix);
	gl_FragColor = vec4(intensity, 1.0);
}


)"
