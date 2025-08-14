R"(

uniform sampler2D texture0;
uniform sampler2D texture1;
uniform float pulsate;
uniform float wobble;
uniform float glow;
uniform float flare;
uniform float bloomScale;
uniform float bloomShift;
uniform float fogMode;
varying vec3 viewXY;
varying vec3 viewDir;
varying vec4 vertexColor;

float getFogFactor(float distance) {
	if (fogMode == 0.0) {
        return clamp((gl_Fog.end - distance) / (gl_Fog.end - gl_Fog.start), 0.0, 1.0);
    } else if (fogMode == 1.0) {
        return clamp(exp(-gl_Fog.density * distance), 0.0, 1.0);
    } else if (fogMode == 2.0) {
        return clamp(exp(-gl_Fog.density * gl_Fog.density * distance * distance), 0.0, 1.0);
	} else {
		return 1.0;
	}
}

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

void main (void) {
	vec3 texCoords = vec3(gl_TexCoord[0].xy, 0.0);
	vec3 normXY = normalize(viewXY);
	texCoords += vec3(normXY.y * -pulsate, normXY.x * pulsate, 0.0);
	texCoords += vec3(normXY.y * -wobble * texCoords.y, wobble * texCoords.y, 0.0);
	vec3 viewv = normalize(viewDir);
	// iterative parallax mapping
	float scale = 0.010;
	float bias = -0.005;
	for(int i = 0; i < 4; ++i) {
		vec4 normal = texture2D(texture1, texCoords.xy);
		float h = normal.a * scale + bias;
		texCoords.x += h * viewv.x;
		texCoords.y -= h * viewv.y;
	}
	vec3 norm = (texture2D(texture1, texCoords.xy).rgb - 0.5) * 2.0;
	float diffuse = 0.5 + abs(dot(norm, viewv))*0.5;
	if (glow > 0.001) {
		diffuse = 1.0;
	}
	vec4 color = texture2DNearAA(texture0, texCoords.xy);
	vec3 intensity = clamp(vertexColor.rgb, glow, 1.0);
	intensity = clamp(intensity * bloomScale + bloomShift, 0.0, 1.0);
#ifdef GAMMA_CORRECTED_BLENDING
	intensity = intensity * intensity; // approximation of pow(intensity, 2.2)
#endif
	float fogFactor = getFogFactor(length(viewDir));
	gl_FragColor = vec4(mix(vec3(0.0, 0.0, 0.0), color.rgb * intensity, fogFactor), vertexColor.a * color.a);
}

)"
