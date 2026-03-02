"use client"

import { cn } from "@litedag/ui/lib/utils"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import React, { useMemo, useRef } from "react"
import * as THREE from "three"

export const DotMatrix = ({
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
}: {
  opacities?: number[]
  colors?: number[][]
  containerClassName?: string
  dotSize?: number
  showGradient?: boolean
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrixShader
          colors={colors}
          dotSize={dotSize}
          opacities={opacities}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-[84%]" />
      )}
    </div>
  )
}

const DotMatrixShader = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 4,
  dotSize = 2,
}: {
  colors?: number[][]
  opacities?: number[]
  totalSize?: number
  dotSize?: number
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0]!,
      colors[0]!,
      colors[0]!,
      colors[0]!,
      colors[0]!,
      colors[0]!,
    ]
    if (colors.length === 2) {
      colorsArray = [
        colors[0]!,
        colors[0]!,
        colors[0]!,
        colors[1]!,
        colors[1]!,
        colors[1]!,
      ]
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0]!,
        colors[0]!,
        colors[1]!,
        colors[1]!,
        colors[2]!,
        colors[2]!,
      ]
    }

    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0]! / 255,
          color[1]! / 255,
          color[2]! / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
    }
  }, [colors, opacities, totalSize, dotSize])

  return (
    <ShaderCanvas
      source={FRAGMENT_SHADER}
      uniforms={uniforms}
      maxFps={60}
    />
  )
}

const FRAGMENT_SHADER = `
  in vec2 fragCoord;

  uniform float u_time;
  uniform float u_opacities[10];
  uniform vec3 u_colors[6];
  uniform float u_total_size;
  uniform float u_dot_size;
  uniform vec2 u_resolution;
  out vec4 fragColor;

  float PHI = 1.61803398874989484820459;

  float random(vec2 xy) {
    return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
  }

  void main() {
    vec2 st = fragCoord.xy;
    st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
    st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

    float opacity = step(0.0, st.x);
    opacity *= step(0.0, st.y);

    vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

    float frequency = 5.0;
    float show_offset = random(st2);
    float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency) + 1.0);
    opacity *= u_opacities[int(rand * 10.0)];
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

    vec3 color = u_colors[int(show_offset * 6.0)];

    fragColor = vec4(color, opacity);
    fragColor.rgb *= fragColor.a;
  }
`

const VERTEX_SHADER = `
  uniform vec2 u_resolution;
  out vec2 fragCoord;
  void main(){
    float x = position.x;
    float y = position.y;
    gl_Position = vec4(x, y, 0.0, 1.0);
    fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;
  }
`

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number
    type: string
  }
}

const ShaderMesh = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string
  maxFps?: number
  uniforms: Uniforms
}) => {
  const { size } = useThree()
  const ref = useRef<THREE.Mesh>(null)
  let lastFrameTime = 0

  useFrame(({ clock }) => {
    if (!ref.current) return
    const timestamp = clock.getElapsedTime()
    if (timestamp - lastFrameTime < 1 / maxFps) {
      return
    }
    lastFrameTime = timestamp

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const material = ref.current.material as any
    material.uniforms.u_time.value = timestamp
  })

  const getUniforms = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preparedUniforms: any = {}

    for (const uniformName in uniforms) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniform: any = uniforms[uniformName]

      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" }
          break
        case "uniform3f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector3().fromArray(uniform.value),
            type: "3f",
          }
          break
        case "uniform1fv":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" }
          break
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map((v: number[]) =>
              new THREE.Vector3().fromArray(v),
            ),
            type: "3fv",
          }
          break
        case "uniform2f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value),
            type: "2f",
          }
          break
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`)
          break
      }
    }

    preparedUniforms["u_time"] = { value: 0, type: "1f" }
    preparedUniforms["u_resolution"] = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    }
    return preparedUniforms
  }

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, source])

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const ShaderCanvas = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string
  uniforms: Uniforms
  maxFps?: number
}) => {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMesh source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  )
}
