import { useMemo } from 'react'
import type { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three'
import type UniformNode from 'three/src/nodes/core/UniformNode.js'
import { uniform } from 'three/tsl'

type UniformValue =
  | number
  | boolean
  | Color
  | Vector2
  | Vector3
  | Vector4
  | Matrix3
  | Matrix4

type ToUniformNode<V> = V extends boolean
  ? UniformNode<'bool', boolean>
  : V extends number
  ? UniformNode<'float', number>
  : V extends Color
  ? UniformNode<'color', Color>
  : V extends Vector2
  ? UniformNode<'vec2', Vector2>
  : V extends Vector3
  ? UniformNode<'vec3', Vector3>
  : V extends Vector4
  ? UniformNode<'vec4', Vector4>
  : V extends Matrix3
  ? UniformNode<'mat3', Matrix3>
  : V extends Matrix4
  ? UniformNode<'mat4', Matrix4>
  : never

type Nodes<T extends Record<string, UniformValue>> = {
  [K in keyof T]: ToUniformNode<T[K]>
}

type SetValue<V> = V extends Color ? Color | string | number : V

export function useUniforms<T extends Record<string, UniformValue>>(
  initialValues: T
) {
  return useMemo(() => {
    const entries = Object.entries(initialValues).map(
      ([key, value]) =>
        [key, (uniform as (v: UniformValue) => unknown)(value)] as const
    )
    const nodes = Object.fromEntries(entries) as Nodes<T>

    const set = (
      updates: Partial<{ [K in keyof T]: SetValue<T[K]> }>
    ) => {
      for (const key of Object.keys(updates) as (keyof T & string)[]) {
        const node = nodes[key] as UniformNode<string, unknown> | undefined
        if (!node) continue
        const incoming = updates[key]
        const current = node.value
        if (
          current != null &&
          typeof current === 'object' &&
          'set' in current &&
          typeof (current as Record<string, unknown>).set === 'function'
        ) {
          ; (current as { set: (v: unknown) => void }).set(incoming)
        } else {
          node.value = incoming
        }
      }
    }

    return [nodes, set] as const
  }, [initialValues])
}
