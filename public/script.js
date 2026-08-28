(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finishNames = {
    checkerboard: "Checkerboard",
    "color-gradient": "Color gradient",
    "grayscale-gradient": "Grayscale gradient",
  };

  let viewerApi = null;
  let selectedFinish = "checkerboard";

  function currentTheme() {
    return root.dataset.theme || (systemTheme.matches ? "dark" : "light");
  }

  function updateThemeToggle() {
    const dark = currentTheme() === "dark";
    const label = `Use ${dark ? "light" : "dark"} theme`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
    themeColor.content = dark ? "#191817" : "#f1eee8";
  }

  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    updateThemeToggle();
  });

  systemTheme.addEventListener("change", () => {
    if (!root.dataset.theme) updateThemeToggle();
  });
  updateThemeToggle();

  document.querySelectorAll("[data-finish]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFinish = button.dataset.finish;
      document.querySelectorAll("[data-finish]").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      document.querySelector("#selected-finish").textContent = finishNames[selectedFinish];
      viewerApi?.setFinish(selectedFinish);
    });
  });

  document.querySelectorAll("[data-view-action]").forEach((button) => {
    button.addEventListener("click", () => viewerApi?.action(button.dataset.viewAction));
  });

  const canvas = document.querySelector("#hand-canvas");
  const viewport = document.querySelector("#viewport");
  const loadingState = document.querySelector("#loading-state");
  const fallback = document.querySelector("#viewer-fallback");
  const status = document.querySelector("#viewer-status");

  viewport.addEventListener("contextmenu", (event) => event.preventDefault());

  function showFallback(message) {
    loadingState.classList.add("is-hidden");
    viewport.classList.add("has-fallback");
    fallback.hidden = false;
    canvas.hidden = true;
    status.textContent = message || "3D preview unavailable";
  }

  const M = {
    identity() {
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },

    multiply(a, b) {
      const out = new Float32Array(16);
      for (let c = 0; c < 4; c += 1) {
        for (let r = 0; r < 4; r += 1) {
          out[c * 4 + r] =
            a[r] * b[c * 4] +
            a[4 + r] * b[c * 4 + 1] +
            a[8 + r] * b[c * 4 + 2] +
            a[12 + r] * b[c * 4 + 3];
        }
      }
      return out;
    },

    fromTRS(t, q, s) {
      const [x, y, z, w] = q;
      const x2 = x + x;
      const y2 = y + y;
      const z2 = z + z;
      const xx = x * x2;
      const xy = x * y2;
      const xz = x * z2;
      const yy = y * y2;
      const yz = y * z2;
      const zz = z * z2;
      const wx = w * x2;
      const wy = w * y2;
      const wz = w * z2;
      return new Float32Array([
        (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
        (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
        (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
        t[0], t[1], t[2], 1,
      ]);
    },

    translation(x, y, z) {
      const out = M.identity();
      out[12] = x;
      out[13] = y;
      out[14] = z;
      return out;
    },

    scale(x, y, z) {
      const out = M.identity();
      out[0] = x;
      out[5] = y;
      out[10] = z;
      return out;
    },

    rotationX(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
    },

    rotationZ(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },

    invert(a) {
      const out = new Float32Array(16);
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      const b00 = a00 * a11 - a01 * a10;
      const b01 = a00 * a12 - a02 * a10;
      const b02 = a00 * a13 - a03 * a10;
      const b03 = a01 * a12 - a02 * a11;
      const b04 = a01 * a13 - a03 * a11;
      const b05 = a02 * a13 - a03 * a12;
      const b06 = a20 * a31 - a21 * a30;
      const b07 = a20 * a32 - a22 * a30;
      const b08 = a20 * a33 - a23 * a30;
      const b09 = a21 * a32 - a22 * a31;
      const b10 = a21 * a33 - a23 * a31;
      const b11 = a22 * a33 - a23 * a32;
      let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!determinant) return M.identity();
      determinant = 1 / determinant;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * determinant;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * determinant;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * determinant;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * determinant;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * determinant;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * determinant;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * determinant;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * determinant;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * determinant;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * determinant;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * determinant;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * determinant;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * determinant;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * determinant;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * determinant;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * determinant;
      return out;
    },

    perspective(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0,
      ]);
    },

    lookAt(eye, center, up) {
      let zx = eye[0] - center[0];
      let zy = eye[1] - center[1];
      let zz = eye[2] - center[2];
      let length = Math.hypot(zx, zy, zz) || 1;
      zx /= length; zy /= length; zz /= length;
      let xx = up[1] * zz - up[2] * zy;
      let xy = up[2] * zx - up[0] * zz;
      let xz = up[0] * zy - up[1] * zx;
      length = Math.hypot(xx, xy, xz) || 1;
      xx /= length; xy /= length; xz /= length;
      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;
      return new Float32Array([
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
        -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
        -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
        1,
      ]);
    },

    point(matrix, point) {
      const [x, y, z] = point;
      return [
        matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
        matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
        matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
      ];
    },
  };

  function slerp(a, b, t) {
    let cos = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    const end = [...b];
    if (cos < 0) {
      cos = -cos;
      for (let i = 0; i < 4; i += 1) end[i] = -end[i];
    }
    if (cos > 0.9995) {
      const out = a.map((value, index) => value + (end[index] - value) * t);
      const length = Math.hypot(...out) || 1;
      return out.map((value) => value / length);
    }
    const theta = Math.acos(Math.min(1, cos));
    const sinTheta = Math.sin(theta);
    const one = Math.sin((1 - t) * theta) / sinTheta;
    const two = Math.sin(t * theta) / sinTheta;
    return a.map((value, index) => value * one + end[index] * two);
  }

  function quatFromAxisAngle(axis, angle) {
    const half = angle / 2;
    const s = Math.sin(half);
    return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
  }

  function quatMultiply(a, b) {
    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;
    return [
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw,
      aw * bw - ax * bx - ay * by - az * bz,
    ];
  }

  function quatNormalize(q) {
    const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
    return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
  }

  function quatRotateVector(q, v) {
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    const uvx = qy * v[2] - qz * v[1];
    const uvy = qz * v[0] - qx * v[2];
    const uvz = qx * v[1] - qy * v[0];
    const uuvx = qy * uvz - qz * uvy;
    const uuvy = qz * uvx - qx * uvz;
    const uuvz = qx * uvy - qy * uvx;
    return [
      v[0] + (uvx * qw + uuvx) * 2,
      v[1] + (uvy * qw + uuvy) * 2,
      v[2] + (uvz * qw + uuvz) * 2,
    ];
  }

  const accessorTypes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const componentTypes = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
  };

  function parseGLB(buffer) {
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
      throw new Error("The hand asset is not a valid glTF 2.0 binary.");
    }
    let offset = 12;
    let json;
    let binary;
    while (offset < buffer.byteLength) {
      const length = view.getUint32(offset, true);
      const type = view.getUint32(offset + 4, true);
      const chunk = buffer.slice(offset + 8, offset + 8 + length);
      if (type === 0x4e4f534a) {
        json = JSON.parse(new TextDecoder().decode(chunk).replace(/\0+$/, ""));
      } else if (type === 0x004e4942) {
        binary = chunk;
      }
      offset += 8 + length;
    }
    if (!json || !binary) throw new Error("The hand asset is incomplete.");
    return { json, binary };
  }

  function createAccessorReader(json, binary) {
    return function readAccessor(index) {
      const accessor = json.accessors[index];
      const view = json.bufferViews[accessor.bufferView];
      const Constructor = componentTypes[accessor.componentType];
      const itemSize = accessorTypes[accessor.type];
      const componentSize = Constructor.BYTES_PER_ELEMENT;
      const packedStride = componentSize * itemSize;
      const stride = view.byteStride || packedStride;
      const byteOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
      if (stride === packedStride && byteOffset % componentSize === 0) {
        return new Constructor(binary, byteOffset, accessor.count * itemSize).slice();
      }
      const output = new Constructor(accessor.count * itemSize);
      const source = new DataView(binary);
      const getters = {
        5120: "getInt8",
        5121: "getUint8",
        5122: "getInt16",
        5123: "getUint16",
        5125: "getUint32",
        5126: "getFloat32",
      };
      const getter = getters[accessor.componentType];
      for (let item = 0; item < accessor.count; item += 1) {
        for (let component = 0; component < itemSize; component += 1) {
          output[item * itemSize + component] = source[getter](byteOffset + item * stride + component * componentSize, true);
        }
      }
      return output;
    };
  }

  function compileProgram(gl, vertexSource, fragmentSource) {
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`WebGL shader error: ${message}`);
      }
      return shader;
    }
    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`WebGL program error: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
  }

  function uploadAttribute(gl, location, data, size, integer) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    let type = gl.FLOAT;
    if (data instanceof Uint16Array) type = gl.UNSIGNED_SHORT;
    else if (data instanceof Uint8Array) type = gl.UNSIGNED_BYTE;
    else if (data instanceof Int16Array) type = gl.SHORT;
    else if (data instanceof Int8Array) type = gl.BYTE;
    if (integer) gl.vertexAttribIPointer(location, size, type, 0, 0);
    else gl.vertexAttribPointer(location, size, type, false, 0, 0);
    return buffer;
  }

  function drawNailFinish(name) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext("2d");
    if (name === "checkerboard") {
      const squareSize = 32;
      for (let y = 0; y < 256; y += squareSize) {
        for (let x = 0; x < 256; x += squareSize) {
          context.fillStyle = (x / squareSize + y / squareSize) % 2 === 0 ? "#ffffff" : "#171717";
          context.fillRect(x, y, squareSize, squareSize);
        }
      }
    } else if (name === "color-gradient") {
      const gradient = context.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, "#ff3b30");
      gradient.addColorStop(0.2, "#ffcc00");
      gradient.addColorStop(0.4, "#34c759");
      gradient.addColorStop(0.6, "#00c7be");
      gradient.addColorStop(0.8, "#007aff");
      gradient.addColorStop(1, "#af52de");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    } else {
      const gradient = context.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#000000");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }
    return textureCanvas;
  }

  function decodeImage(blob) {
    if ("createImageBitmap" in window) return createImageBitmap(blob);
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(blob);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The hand texture could not be decoded."));
      };
      image.src = url;
    });
  }

  async function createViewer() {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL 2 is not available in this browser.");

    const response = await fetch("/assets/models/rigged-hand.glb");
    if (!response.ok) throw new Error(`The hand model could not be loaded (${response.status}).`);
    const { json, binary } = parseGLB(await response.arrayBuffer());
    const readAccessor = createAccessorReader(json, binary);
    const primitive = json.meshes[0].primitives[0];

    if (primitive.attributes.JOINTS_0 == null || primitive.attributes.WEIGHTS_0 == null || !json.skins?.length) {
      throw new Error("The supplied model does not contain the expected hand rig.");
    }

    const skinVertex = `#version 300 es
      precision highp float;
      precision highp int;
      layout(location=0) in vec3 a_position;
      layout(location=1) in vec3 a_normal;
      layout(location=2) in vec2 a_uv;
      layout(location=3) in uvec4 a_joints;
      layout(location=4) in vec4 a_weights;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform mat4 u_viewer;
      uniform highp sampler2D u_bones;
      out vec2 v_uv;
      out vec3 v_normal;
      out vec3 v_position;
      mat4 bone(uint index) {
        int row = int(index);
        return mat4(
          texelFetch(u_bones, ivec2(0, row), 0),
          texelFetch(u_bones, ivec2(1, row), 0),
          texelFetch(u_bones, ivec2(2, row), 0),
          texelFetch(u_bones, ivec2(3, row), 0)
        );
      }
      void main() {
        vec4 weights = a_weights / max(dot(a_weights, vec4(1.0)), 0.0001);
        mat4 skin = weights.x * bone(a_joints.x)
                  + weights.y * bone(a_joints.y)
                  + weights.z * bone(a_joints.z)
                  + weights.w * bone(a_joints.w);
        vec4 world = u_viewer * skin * vec4(a_position, 1.0);
        v_position = world.xyz;
        v_normal = normalize(mat3(u_viewer * skin) * a_normal);
        v_uv = a_uv;
        gl_Position = u_projection * u_view * world;
      }
    `;

    // Nail UV islands: each rectangle is a region of the shared skin UV map
    // that is remapped to local 0..1 coordinates and sampled from the dynamic
    // nail texture instead of the skin texture.
    const skinFragment = `#version 300 es
      precision highp float;
      in vec2 v_uv;
      in vec3 v_normal;
      in vec3 v_position;
      uniform sampler2D u_skinTexture;
      uniform sampler2D u_nailTexture;
      out vec4 outColor;

      const int NAIL_COUNT = 5;
      const vec4 NAIL_UV_RECTS[NAIL_COUNT] = vec4[NAIL_COUNT](
        vec4(0.7237607241, 0.3519485891, 0.7907230854, 0.4083442986),
        vec4(0.7300586700, 0.2282793373, 0.7766602039, 0.2878110707),
        vec4(0.8480325937, 0.3488490283, 0.8956496119, 0.4065266252),
        vec4(0.8529052138, 0.2294050008, 0.8949750662, 0.2841750085),
        vec4(0.7338642478, 0.1401616335, 0.7712491155, 0.1821782440)
      );

      void main() {
        vec3 normal = normalize(v_normal);
        vec3 key = normalize(vec3(-0.42, 0.82, 0.58));
        vec3 fill = normalize(vec3(0.72, 0.15, 0.68));
        float diffuse = max(dot(normal, key), 0.0) * 0.72 + max(dot(normal, fill), 0.0) * 0.22;
        vec3 viewDirection = normalize(vec3(0.0, 0.0, 4.0) - v_position);
        float rim = pow(1.0 - abs(dot(normal, viewDirection)), 2.4);

        bool isNail = false;
        vec2 localUv = vec2(0.0);
        for (int i = 0; i < NAIL_COUNT; i += 1) {
          vec4 rect = NAIL_UV_RECTS[i];
          if (v_uv.x >= rect.x && v_uv.x <= rect.z && v_uv.y >= rect.y && v_uv.y <= rect.w) {
            localUv = (v_uv - rect.xy) / (rect.zw - rect.xy);
            isNail = true;
          }
        }

        vec3 color;
        if (isNail) {
          vec3 base = texture(u_nailTexture, localUv).rgb;
          vec3 halfVector = normalize(key + viewDirection);
          float gloss = pow(max(dot(normal, halfVector), 0.0), 62.0);
          color = base * (0.48 + diffuse * 0.66) + vec3(1.0) * gloss * 0.68 + vec3(0.72, 0.78, 1.0) * rim * 0.22;
        } else {
          vec3 base = texture(u_skinTexture, v_uv).rgb;
          base = mix(base, vec3(0.96, 0.72, 0.62), 0.055);
          color = base * (0.47 + diffuse) + vec3(0.24, 0.18, 0.25) * rim * 0.18;
        }
        outColor = vec4(pow(color, vec3(0.92)), 1.0);
      }
    `;

    const skinProgram = compileProgram(gl, skinVertex, skinFragment);

    const positionData = readAccessor(primitive.attributes.POSITION);
    const jointData = readAccessor(primitive.attributes.JOINTS_0);
    const weightData = readAccessor(primitive.attributes.WEIGHTS_0);
    const skinVao = gl.createVertexArray();
    gl.bindVertexArray(skinVao);
    uploadAttribute(gl, 0, positionData, 3, false);
    uploadAttribute(gl, 1, readAccessor(primitive.attributes.NORMAL), 3, false);
    uploadAttribute(gl, 2, readAccessor(primitive.attributes.TEXCOORD_0), 2, false);
    uploadAttribute(gl, 3, jointData, 4, true);
    uploadAttribute(gl, 4, weightData, 4, false);
    const indexData = readAccessor(primitive.indices);
    const skinIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skinIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
    const skinIndexType = indexData instanceof Uint32Array ? gl.UNSIGNED_INT : indexData instanceof Uint16Array ? gl.UNSIGNED_SHORT : gl.UNSIGNED_BYTE;

    const skinTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, skinTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([225, 163, 142, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    const baseTextureIndex = json.materials?.[primitive.material]?.pbrMetallicRoughness?.baseColorTexture?.index;
    if (baseTextureIndex != null) {
      const imageIndex = json.textures[baseTextureIndex].source;
      const imageInfo = json.images[imageIndex];
      const imageView = json.bufferViews[imageInfo.bufferView];
      const imageBytes = binary.slice(imageView.byteOffset || 0, (imageView.byteOffset || 0) + imageView.byteLength);
      const image = await decodeImage(new Blob([imageBytes], { type: imageInfo.mimeType }));
      gl.bindTexture(gl.TEXTURE_2D, skinTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      image.close?.();
    }

    const nailTexture = gl.createTexture();
    function setFinish(name) {
      const textureCanvas = drawNailFinish(name);
      gl.bindTexture(gl.TEXTURE_2D, nailTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }
    setFinish(selectedFinish);

    const nodes = json.nodes;
    const parent = new Int16Array(nodes.length).fill(-1);
    nodes.forEach((node, nodeIndex) => node.children?.forEach((child) => { parent[child] = nodeIndex; }));
    const basePose = nodes.map((node) => ({
      translation: [...(node.translation || [0, 0, 0])],
      rotation: [...(node.rotation || [0, 0, 0, 1])],
      scale: [...(node.scale || [1, 1, 1])],
      matrix: node.matrix ? new Float32Array(node.matrix) : null,
    }));
    const pose = basePose.map((entry) => ({
      translation: [...entry.translation],
      rotation: [...entry.rotation],
      scale: [...entry.scale],
      matrix: entry.matrix,
    }));
    const localMatrices = nodes.map(() => M.identity());
    const worldMatrices = nodes.map(() => M.identity());

    const animation = json.animations?.[0];
    const tracks = animation ? animation.channels.map((channel) => {
      const sampler = animation.samplers[channel.sampler];
      return {
        node: channel.target.node,
        path: channel.target.path,
        input: readAccessor(sampler.input),
        output: readAccessor(sampler.output),
        width: channel.target.path === "rotation" ? 4 : 3,
      };
    }) : [];
    const animationDuration = tracks.reduce((maximum, track) => Math.max(maximum, track.input[track.input.length - 1] || 0), 0);

    function sampleTrack(track, time) {
      const times = track.input;
      let low = 0;
      let high = times.length - 1;
      while (low < high - 1) {
        const middle = (low + high) >> 1;
        if (times[middle] <= time) low = middle;
        else high = middle;
      }
      const next = Math.min(low + 1, times.length - 1);
      const range = times[next] - times[low];
      const alpha = range > 0 ? Math.max(0, Math.min(1, (time - times[low]) / range)) : 0;
      const start = Array.from(track.output.subarray(low * track.width, low * track.width + track.width));
      const end = Array.from(track.output.subarray(next * track.width, next * track.width + track.width));
      return track.path === "rotation"
        ? slerp(start, end, alpha)
        : start.map((value, index) => value + (end[index] - value) * alpha);
    }

    function updatePose(time) {
      for (let index = 0; index < pose.length; index += 1) {
        pose[index].translation.splice(0, 3, ...basePose[index].translation);
        pose[index].rotation.splice(0, 4, ...basePose[index].rotation);
        pose[index].scale.splice(0, 3, ...basePose[index].scale);
      }
      tracks.forEach((track) => {
        pose[track.node][track.path] = sampleTrack(track, time);
      });
      const visiting = new Uint8Array(nodes.length);
      function updateNode(index) {
        if (visiting[index] === 2) return;
        if (visiting[index] === 1) throw new Error("The hand rig contains a node cycle.");
        visiting[index] = 1;
        const p = pose[index];
        localMatrices[index] = p.matrix || M.fromTRS(p.translation, p.rotation, p.scale);
        if (parent[index] >= 0) {
          updateNode(parent[index]);
          worldMatrices[index] = M.multiply(worldMatrices[parent[index]], localMatrices[index]);
        } else {
          worldMatrices[index] = localMatrices[index];
        }
        visiting[index] = 2;
      }
      nodes.forEach((_, index) => updateNode(index));
    }
    updatePose(animationDuration * 0.1);

    const skin = json.skins[0];
    const inverseBindData = readAccessor(skin.inverseBindMatrices);
    const jointMatrices = new Float32Array(skin.joints.length * 16);
    skin.joints.forEach((nodeIndex, jointIndex) => {
      const inverseBind = inverseBindData.subarray(jointIndex * 16, jointIndex * 16 + 16);
      jointMatrices.set(M.multiply(worldMatrices[nodeIndex], inverseBind), jointIndex * 16);
    });

    const worldMin = [Infinity, Infinity, Infinity];
    const worldMax = [-Infinity, -Infinity, -Infinity];
    for (let vertex = 0; vertex < positionData.length / 3; vertex += 1) {
      const position = positionData.subarray(vertex * 3, vertex * 3 + 3);
      const weightOffset = vertex * 4;
      const weightTotal = Math.max(
        weightData[weightOffset] + weightData[weightOffset + 1] + weightData[weightOffset + 2] + weightData[weightOffset + 3],
        0.0001,
      );
      const skinned = [0, 0, 0];
      for (let influence = 0; influence < 4; influence += 1) {
        const jointIndex = jointData[weightOffset + influence];
        const matrix = jointMatrices.subarray(jointIndex * 16, jointIndex * 16 + 16);
        const point = M.point(matrix, position);
        const weight = weightData[weightOffset + influence] / weightTotal;
        for (let axis = 0; axis < 3; axis += 1) skinned[axis] += point[axis] * weight;
      }
      for (let axis = 0; axis < 3; axis += 1) {
        worldMin[axis] = Math.min(worldMin[axis], skinned[axis]);
        worldMax[axis] = Math.max(worldMax[axis], skinned[axis]);
      }
    }
    const center = worldMin.map((value, axis) => (value + worldMax[axis]) / 2);
    const extent = Math.max(...worldMax.map((value, axis) => value - worldMin[axis]));
    const modelScale = 2.55 / extent;
    const viewerBase = M.multiply(
      M.scale(modelScale, modelScale, modelScale),
      M.multiply(M.rotationX(Math.PI / 2), M.translation(-center[0], -center[1], -center[2])),
    );

    const boneTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, skin.joints.length, 0, gl.RGBA, gl.FLOAT, jointMatrices);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Nail regions are painted directly in the skin fragment shader by
    // remapping fixed UV islands (see NAIL_UV_RECTS above) to local 0..1
    // coordinates and sampling the dynamic nail texture there.
    const nailRegionNames = ["thumb", "index", "middle", "ring", "pinky"];

    const initialYaw = 0.18;
    const initialPitch = 0.08;
    const initialDistance = 4.15;
    const initialQuat = quatNormalize(
      quatMultiply(
        quatFromAxisAngle([0, 1, 0], initialYaw),
        quatFromAxisAngle([1, 0, 0], -initialPitch),
      ),
    );
    const camera = {
      quat: initialQuat,
      targetQuat: initialQuat,
      distance: initialDistance,
      targetDistance: initialDistance,
      pan: [0, 0, 0],
      targetPan: [0, 0, 0],
    };
    const distanceLimits = [2.75, 5.8];

    function clampCamera() {
      camera.targetDistance = Math.max(distanceLimits[0], Math.min(distanceLimits[1], camera.targetDistance));
    }

    function action(name) {
      if (name === "left") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([0, 1, 0], -0.22), camera.targetQuat));
      }
      if (name === "right") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([0, 1, 0], 0.22), camera.targetQuat));
      }
      if (name === "in") camera.targetDistance -= 0.35;
      if (name === "out") camera.targetDistance += 0.35;
      if (name === "reset") {
        camera.targetQuat = initialQuat;
        camera.targetDistance = initialDistance;
        camera.targetPan = [0, 0, 0];
      }
      clampCamera();
    }

    let drag = null;
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.button !== 2) return;
      canvas.setPointerCapture(event.pointerId);
      drag = { pointerId: event.pointerId, button: event.button, x: event.clientX, y: event.clientY };
      event.preventDefault();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.button === 2) {
        const rightWorld = quatRotateVector(camera.targetQuat, [1, 0, 0]);
        const upWorld = quatRotateVector(camera.targetQuat, [0, 1, 0]);
        const panScale = camera.targetDistance * 0.0016;
        camera.targetPan = [
          camera.targetPan[0] + (rightWorld[0] * -dx + upWorld[0] * dy) * panScale,
          camera.targetPan[1] + (rightWorld[1] * -dx + upWorld[1] * dy) * panScale,
          camera.targetPan[2] + (rightWorld[2] * -dx + upWorld[2] * dy) * panScale,
        ];
      } else {
        const dragLength = Math.hypot(dx, dy);
        if (dragLength > 0) {
          const localAxis = [-dy / dragLength, -dx / dragLength, 0];
          const worldAxis = quatRotateVector(camera.targetQuat, localAxis);
          const angle = dragLength * 0.008;
          const deltaQuat = quatFromAxisAngle(worldAxis, angle);
          camera.targetQuat = quatNormalize(quatMultiply(deltaQuat, camera.targetQuat));
        }
      }
      drag.x = event.clientX;
      drag.y = event.clientY;
      clampCamera();
    });
    function releasePointer(event) {
      if (drag?.pointerId === event.pointerId) drag = null;
    }
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("wheel", (event) => {
      camera.targetDistance += event.deltaY * 0.0035;
      clampCamera();
      event.preventDefault();
    }, { passive: false });
    canvas.addEventListener("keydown", (event) => {
      const actions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        "+": "in",
        "=": "in",
        "-": "out",
        _: "out",
        r: "reset",
        R: "reset",
      };
      if (event.key === "ArrowUp") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([1, 0, 0], -0.15), camera.targetQuat));
      } else if (event.key === "ArrowDown") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([1, 0, 0], 0.15), camera.targetQuat));
      } else if (actions[event.key]) action(actions[event.key]);
      else return;
      clampCamera();
      event.preventDefault();
    });

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 0);

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      return width / height;
    }

    let contextLost = false;
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      contextLost = true;
      showFallback("The 3D context was lost");
    });

    const startTime = performance.now();
    function render(now) {
      if (contextLost) return;
      const time = (now - startTime) / 1000;
      const staticPose = animationDuration * 0.1;
      const poseTime = reduceMotion.matches || !animationDuration
        ? staticPose
        : animationDuration * (0.1 + 0.022 * (0.5 + 0.5 * Math.sin(time * 0.72)));
      updatePose(poseTime);

      const damping = reduceMotion.matches ? 1 : 0.1;
      camera.quat = reduceMotion.matches ? camera.targetQuat : quatNormalize(slerp(camera.quat, camera.targetQuat, damping));
      camera.distance += (camera.targetDistance - camera.distance) * damping;
      camera.pan = [0, 1, 2].map((axis) => camera.pan[axis] + (camera.targetPan[axis] - camera.pan[axis]) * damping);

      const upWorld = quatRotateVector(camera.quat, [0, 1, 0]);
      const eye = quatRotateVector(camera.quat, [0, 0, camera.distance]).map((value, axis) => value + camera.pan[axis]);
      const target = camera.pan;
      const projection = M.perspective(Math.PI / 4.1, resize(), 0.05, 30);
      const view = M.lookAt(eye, target, upWorld);
      const idleTilt = reduceMotion.matches ? 0 : Math.sin(time * 0.42) * 0.008;
      const viewerMatrix = M.multiply(M.rotationZ(idleTilt), viewerBase);

      skin.joints.forEach((nodeIndex, jointIndex) => {
        const inverseBind = inverseBindData.subarray(jointIndex * 16, jointIndex * 16 + 16);
        jointMatrices.set(M.multiply(worldMatrices[nodeIndex], inverseBind), jointIndex * 16);
      });
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, boneTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, skin.joints.length, gl.RGBA, gl.FLOAT, jointMatrices);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(skinProgram);
      gl.uniformMatrix4fv(gl.getUniformLocation(skinProgram, "u_projection"), false, projection);
      gl.uniformMatrix4fv(gl.getUniformLocation(skinProgram, "u_view"), false, view);
      gl.uniformMatrix4fv(gl.getUniformLocation(skinProgram, "u_viewer"), false, viewerMatrix);
      gl.uniform1i(gl.getUniformLocation(skinProgram, "u_bones"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, skinTexture);
      gl.uniform1i(gl.getUniformLocation(skinProgram, "u_skinTexture"), 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, nailTexture);
      gl.uniform1i(gl.getUniformLocation(skinProgram, "u_nailTexture"), 2);
      gl.bindVertexArray(skinVao);
      gl.drawElements(gl.TRIANGLES, indexData.length, skinIndexType, 0);
      gl.bindVertexArray(null);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    return { setFinish, action, jointCount: skin.joints.length, nailCount: nailRegionNames.length };
  }

  createViewer()
    .then((api) => {
      viewerApi = api;
      loadingState.classList.add("is-hidden");
      status.textContent = `Ready · ${api.jointCount}-joint rig · ${api.nailCount} nail regions`;
    })
    .catch((error) => {
      console.error(error);
      showFallback(error.message);
    });
})();
