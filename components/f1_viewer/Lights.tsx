"use client";

export default function Lights() {
  return (
    <>
      {/* Studio Ambient Fill */}
      <ambientLight intensity={0.2} />

      {/* Main Overhead Key Light */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <ambientLight intensity={0.4}/>


    <spotLight

    position={[0,5,2]}

    angle={0.5}

    intensity={0.4}

    castShadow

    />


    <pointLight

    position={[5,3,-5]}

    intensity={0.2}

    />

      {/* Rear Cool Rim Light */}
      <directionalLight
        position={[-6, 5, -6]}
        intensity={1.8}
        color="#00f0ff"
      />

      {/* Front Red Warm Fill */}
      <directionalLight
        position={[4, 2, 8]}
        intensity={1.2}
        color="#eb0028"
      />

      {/* Underbody Ground Reflection Light */}
      <pointLight position={[0, -0.4, 0]} intensity={1.5} color="#ffffff" />
    </>
  );
}