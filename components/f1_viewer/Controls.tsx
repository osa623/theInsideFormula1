"use client";

import { OrbitControls } from "@react-three/drei";

export default function Controls(){

return(

<OrbitControls

enablePan={false}

autoRotate

autoRotateSpeed={0.1}

minDistance={4}

maxDistance={12}

maxPolarAngle={Math.PI/2}

/>

)

}