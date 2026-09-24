"use client";

import { Html, useProgress } from "@react-three/drei";

export default function Loading(){

const { progress } = useProgress();

return(

<Html center>

<div className="text-white">

Loading...

<br/>

{progress.toFixed(0)}%

</div>

</Html>

)

}