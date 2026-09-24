export interface CarPartData {
  id: string
  title: string
  category: 'Aerodynamics' | 'Safety' | 'Powertrain' | 'Chassis' | 'Cooling' | 'Suspension' | 'Electronics' | 'Transmission'
  material: string
  purpose: string
  description: string
  technicalDetails: {
    downforce?: string
    performance?: string
    weight?: string
    materialSpec?: string
    efficiency?: string
    temperature?: string
    dragCoeff?: string
  }
  defaultOffset: {
    cameraPosition: [number, number, number]
    target: [number, number, number]
  }
  explodeVector: [number, number, number]
}

export const CAR_PARTS: Record<string, CarPartData> = {
'front-wing': {
  id: 'front-wing',
  title: 'Front Wing Assembly',
  category: 'Aerodynamics',
  material: 'Pre-preg T1000 Carbon Fibre Composite',
  purpose: 'Generates front axle downforce and manages airflow entering the car.',
  description:
    'A multi-element aerodynamic structure consisting of mainplane, flaps, endplates and adjustable aerodynamic surfaces. It controls front downforce balance and conditions airflow around the front tyres.',
  technicalDetails: {
    downforce: 'Approximately 40% of total aerodynamic load',
    weight: '9.2 kg',
    materialSpec: 'Autoclave cured T1000 carbon composite',
    dragCoeff: 'Adjustable flap configuration'
  },
defaultOffset: {
  cameraPosition: [0, 2.5, 8],
  target: [0, -2.8, 2]
},
explodeVector: [0, 0.5, 1.2]
},


'nose': {
  id: 'nose',
  title: 'Nose Cone Structure',
  category: 'Chassis',
  material: 'Carbon Fibre Composite with Zylon Anti-Intrusion Panels',
  purpose: 'Absorbs frontal crash energy and supports front aerodynamic structures.',
  description:
    'The nose cone is an FIA crash-tested structure designed to protect the driver while providing aerodynamic airflow guidance toward the floor.',
  technicalDetails: {
    weight: 'Approx 45 kg including survival cell integration',
    materialSpec: 'Carbon fibre Nomex honeycomb structure',
    efficiency: '350 kJ crash energy absorption'
  },
defaultOffset: {
  cameraPosition: [0, 2.2, 5.5],
  target: [0, 0.8, 1.8]
},
explodeVector: [0, 0.4, 0.8]
},


'turning-vanes': {
  id: 'turning-vanes',
  title: 'Front Turning Vanes',
  category: 'Aerodynamics',
  material: 'Carbon Fibre Composite',
  purpose: 'Controls airflow direction from the front wing toward the floor tunnels.',
  description:
    'Vertical aerodynamic surfaces positioned behind the front wheels that create controlled vortices to improve underbody airflow.',
  technicalDetails: {
    downforce: 'Improves floor aerodynamic efficiency',
    weight: '2.5 kg',
    materialSpec: 'High stiffness carbon laminate'
  },
  defaultOffset: {
    cameraPosition: [0.8, 0.8, 2.8],
    target: [0, 0.2, 1.5]
  },
  explodeVector: [0.8, 0, 0]
},


'sidepods': {
  id: 'sidepods',
  title: 'Aerodynamic Sidepods',
  category: 'Cooling',
  material: 'Carbon Fibre Honeycomb Composite',
  purpose:
    'Provides cooling airflow management while generating aerodynamic downwash.',
  description:
    'The sidepod bodywork houses cooling systems and shapes airflow around the rear section of the car.',
  technicalDetails: {
    downforce: 'Controls rear aerodynamic stability',
    weight: '14.5 kg per side',
    materialSpec: 'Carbon-Kevlar sandwich construction',
    efficiency: 'Optimized cooling airflow'
  },
defaultOffset: {
  cameraPosition: [4, 2.0, 3],
  target: [1, 0.6, 0]
},
  explodeVector: [1.2, 0, 0]
},


'floor': {
  id: 'floor',
  title: 'Venturi Ground Effect Floor',
  category: 'Aerodynamics',
  material: 'Flexible Carbon Fibre Composite',
  purpose:
    'Creates ground effect suction using low-pressure airflow tunnels.',
  description:
    'The floor is the largest aerodynamic component on modern F1 cars, producing the majority of downforce through Venturi tunnels.',
  technicalDetails: {
    downforce: 'Majority of total aerodynamic load',
    weight: '28 kg',
    materialSpec: 'Flexible carbon composite with titanium skid blocks',
    dragCoeff: 'Optimized ground effect airflow'
  },
  defaultOffset: {
    cameraPosition: [2, 0.5, -1],
    target: [0, 0, -0.5]
  },
  explodeVector: [0, -1, 0]
},


'diffuser': {
  id: 'diffuser',
  title: 'Rear Diffuser',
  category: 'Aerodynamics',
  material: 'Carbon Fibre Composite',
  purpose:
    'Accelerates underbody airflow and creates rear aerodynamic stability.',
  description:
    'The diffuser expands airflow exiting the Venturi tunnels, recovering pressure and generating additional rear downforce.',
  technicalDetails: {
    downforce: 'Major rear downforce contributor',
    weight: '8 kg',
    materialSpec: 'High temperature carbon composite'
  },
  defaultOffset: {
    cameraPosition: [0, 1, -4],
    target: [0, 0.2, -2]
  },
  explodeVector: [0, -0.4, -1]
},


'rear-wing': {
  id: 'rear-wing',
  title: 'Rear Wing Assembly',
  category: 'Aerodynamics',
  material: 'High Modulus Carbon Fibre',
  purpose:
    'Creates rear downforce and improves high-speed cornering stability.',
  description:
    'A two-element aerodynamic wing system including mainplane and flap controlled by DRS technology.',
  technicalDetails: {
    downforce: 'Approximately 35% aerodynamic contribution',
    weight: '11.8 kg',
    materialSpec: 'High temperature carbon composite',
    dragCoeff: 'DRS reduces drag during straights'
  },
defaultOffset: {
  cameraPosition: [0, 2.5, -6],
  target: [0, 1, -3]
},
  explodeVector: [0, 0.6, -1.2]
},


'drs': {
  id: 'drs',
  title: 'Drag Reduction System',
  category: 'Aerodynamics',
  material: 'Carbon Fibre Flap with Hydraulic Actuator',
  purpose:
    'Reduces aerodynamic drag to increase straight-line speed.',
  description:
    'A movable rear wing flap activated under FIA regulations to reduce drag on designated track sections.',
  technicalDetails: {
    performance: '+10-15 km/h straight-line advantage',
    weight: 'Hydraulic mechanism included',
    materialSpec: 'Carbon fibre aerodynamic flap'
  },
  defaultOffset: {
    cameraPosition: [0, 2, -4],
    target: [0, 1, -2]
  },
  explodeVector: [0, 0.8, -1]
},


'halo': {
  id: 'halo',
  title: 'Halo Driver Protection System',
  category: 'Safety',
  material: 'Grade 5 Titanium Alloy Ti-6Al-4V',
  purpose:
    'Protects the driver cockpit from large debris and impacts.',
  description:
    'A titanium safety structure capable of supporting extreme vertical loads while maintaining visibility.',
  technicalDetails: {
    weight: '7 kg',
    materialSpec: 'Machined titanium alloy',
    efficiency: '125 kN load resistance'
  },
defaultOffset: {
  cameraPosition: [2.8, 2.8, 3.8],
  target: [0, 1.2, 0]
},
explodeVector: [0, 1, 0]
},


'monocoque': {
  id: 'monocoque',
  title: 'Carbon Fibre Survival Cell',
  category: 'Safety',
  material: 'Carbon Fibre Nomex Honeycomb Composite',
  purpose:
    'Protects the driver during high energy impacts.',
  description:
    'The central structural component of the F1 car where the cockpit, suspension and power unit connect.',
  technicalDetails: {
    weight: '45 kg minimum FIA structure',
    materialSpec: 'Carbon composite sandwich structure',
    efficiency: 'Extreme crash protection'
  },
defaultOffset: {
  cameraPosition: [-3, 2, 4],
  target: [0, 0.8, 0]
},
explodeVector: [0, 0, 0]
},

'engine': {
  id: 'engine',
  title: '1.6L V6 Turbo Hybrid Power Unit',
  category: 'Powertrain',
  material: 'Aluminium Alloy, Titanium and Inconel Components',
  purpose:
    'Provides combustion power combined with hybrid electrical energy recovery.',
  description:
    'A highly efficient Formula 1 power unit consisting of a 1.6L turbocharged V6 internal combustion engine combined with electric motor systems.',
  technicalDetails: {
    performance: '1000+ horsepower combined output',
    weight: 'Minimum FIA regulated mass',
    materialSpec: 'High temperature aerospace alloys',
    efficiency: '>50% thermal efficiency'
  },
defaultOffset: {
  cameraPosition: [-3.5, 2, -3.5],
  target: [0, 0.8, -1]
},
explodeVector: [0, 1, -0.8]
},


'turbo': {
  id: 'turbo',
  title: 'Turbocharger System',
  category: 'Powertrain',
  material: 'Inconel High Temperature Alloy',
  purpose:
    'Compresses intake air to increase combustion efficiency and engine output.',
  description:
    'The turbocharger uses exhaust energy to force more air into the combustion chamber while improving overall efficiency.',
  technicalDetails: {
    performance: 'Operates above 100,000 RPM',
    materialSpec: 'Heat resistant Inconel alloy',
    temperature: '900°C+ exhaust environment',
    efficiency: 'Energy recovery enabled'
  },
defaultOffset: {
  cameraPosition: [-2.8, 1.8, -3],
  target: [0, 0.7, -1.2]
},
explodeVector: [0.8, 0, -0.5]
},


'mgu-k': {
  id: 'mgu-k',
  title: 'MGU-K Electric Motor Generator',
  category: 'Powertrain',
  material: 'Copper Windings and Permanent Magnets',
  purpose:
    'Recovers braking energy and deploys additional electric power.',
  description:
    'The kinetic motor generator unit converts braking energy into electrical energy stored in the battery system.',
  technicalDetails: {
    performance: '120 kW electrical output',
    weight: 'Approx 7 kg',
    efficiency: 'Energy recovery during braking'
  },
defaultOffset: {
  cameraPosition: [-2.5, 1.5, -2.5],
  target: [0, 0.5, -1]
},
explodeVector: [0.5, 0, -0.5]
},


'battery': {
  id: 'battery',
  title: 'Energy Store Battery Pack',
  category: 'Powertrain',
  material: 'Lithium-Ion High Density Cells',
  purpose:
    'Stores recovered electrical energy for hybrid deployment.',
  description:
    'The battery system stores energy generated from MGU-K recovery and delivers electrical boost during acceleration.',
  technicalDetails: {
    weight: 'Approximately 20 kg',
    materialSpec: 'High density lithium-ion cells',
    efficiency: 'Rapid charge and discharge cycles'
  },
defaultOffset: {
  cameraPosition: [-2.8, 1.8, -2],
  target: [0, 0.5, -1]
},
explodeVector: [0, 0.8, -1]
},


'ecu': {
  id: 'ecu',
  title: 'Electronic Control Unit',
  category: 'Electronics',
  material: 'Automotive Grade Silicon Electronics',
  purpose:
    'Controls engine, hybrid deployment and vehicle systems.',
  description:
    'The ECU manages thousands of parameters including fuel injection, energy recovery and engine performance.',
  technicalDetails: {
    efficiency: 'Real-time vehicle control',
    materialSpec: 'FIA standard electronics package'
  },
defaultOffset: {
  cameraPosition: [-2, 2, 1],
  target: [0, 0.8, 0]
},
explodeVector: [0.5, 0.5, 0]
},


'exhaust': {
  id: 'exhaust',
  title: 'Titanium Exhaust System',
  category: 'Powertrain',
  material: 'Titanium and Inconel Alloy',
  purpose:
    'Expels combustion gases while recovering exhaust energy.',
  description:
    'A lightweight high-temperature exhaust system designed to withstand extreme thermal loads.',
  technicalDetails: {
    temperature: '1000°C+ operating temperature',
    materialSpec: 'Aerospace titanium alloy',
    efficiency: 'Supports turbo energy recovery'
  },
defaultOffset: {
  cameraPosition: [2.8, 1.8, -3.5],
  target: [0, 0.6, -2]
},
explodeVector: [1, 0, -1]
},


'gearbox': {
  id: 'gearbox',
  title: '8-Speed Seamless Gearbox',
  category: 'Transmission',
  material: 'Titanium Casing and Magnesium Components',
  purpose:
    'Transfers engine power to the rear wheels.',
  description:
    'A highly compact sequential transmission designed for ultra-fast gear changes.',
  technicalDetails: {
    performance: '8 forward gears + reverse',
    weight: 'Extremely lightweight construction',
    materialSpec: 'Titanium gearbox housing'
  },
defaultOffset: {
  cameraPosition: [1.8, 1.5, -3],
  target: [0, 0.6, -1.5]
},
explodeVector: [0, 0.5, -0.5]
},


'differential': {
  id: 'differential',
  title: 'Rear Differential System',
  category: 'Transmission',
  material: 'Machined Steel Components',
  purpose:
    'Allows rear wheels to rotate at different speeds during cornering.',
  description:
    'A precision mechanical system controlling torque distribution between rear wheels.',
  technicalDetails: {
    efficiency: 'Optimized traction management',
    materialSpec: 'High strength steel gears'
  },
defaultOffset: {
  cameraPosition: [0, 1.2, -3.5],
  target: [0, 0.5, -2]
},
explodeVector: [0, 0, -0.8]
},


'front-suspension': {
  id: 'front-suspension',
  title: 'Front Push Rod Suspension',
  category: 'Suspension',
  material: 'Carbon Fibre Wishbones and Titanium Components',
  purpose:
    'Controls front wheel movement and aerodynamic platform stability.',
  description:
    'A double wishbone suspension system optimized for mechanical grip and aerodynamic consistency.',
  technicalDetails: {
    weight: 'Ultra lightweight construction',
    materialSpec: 'Carbon composite suspension arms'
  },
defaultOffset: {
  cameraPosition: [3.5, 1.8, 3],
  target: [1, 0.5, 1]
},
explodeVector: [1, 0, 1]
},


'rear-suspension': {
  id: 'rear-suspension',
  title: 'Rear Suspension Assembly',
  category: 'Suspension',
  material: 'Carbon Fibre and Titanium Alloy',
  purpose:
    'Maintains rear tyre contact and traction under acceleration.',
  description:
    'Rear suspension geometry designed for maximum traction and aerodynamic stability.',
  technicalDetails: {
    materialSpec: 'Carbon fibre wishbones',
    efficiency: 'High-speed stability'
  },
defaultOffset: {
  cameraPosition: [-3, 1.8, -3],
  target: [0, 0.5, -1]
},
explodeVector: [-1, 0, -1]
},


'push-rods': {
  id: 'push-rods',
  title: 'Push Rod Suspension Links',
  category: 'Suspension',
  material: 'Carbon Fibre Composite',
  purpose:
    'Transfers wheel movement forces into the suspension dampers.',
  description:
    'Aerodynamically shaped suspension components mounted to reduce airflow disruption.',
  technicalDetails: {
    materialSpec: 'High stiffness carbon laminate',
    weight: 'Ultra lightweight'
  },
defaultOffset: {
  cameraPosition: [2.8, 1.5, 2.8],
  target: [1, 0.6, 1]
},
explodeVector: [1, 0.5, 0.5]
},


'radiator': {
  id: 'radiator',
  title: 'Cooling Radiator System',
  category: 'Cooling',
  material: 'Aluminium Core Heat Exchanger',
  purpose:
    'Controls temperature of engine, battery and hydraulic systems.',
  description:
    'High efficiency cooling system receiving airflow through sidepod inlets.',
  technicalDetails: {
    efficiency: 'Extreme thermal management',
    materialSpec: 'Lightweight aluminium construction',
    temperature: 'Maintains power unit operating temperature'
  },
defaultOffset: {
  cameraPosition: [3.5, 1.8, 1],
  target: [1, 0.7, 0]
},
explodeVector: [1.2, 0, 0]
},

'brake-disc': {
  id: 'brake-disc',
  title: 'Carbon Carbon Brake Disc',
  category: 'Suspension',
  material: 'Carbon-Carbon Composite',
  purpose:
    'Provides extreme braking performance under high temperature conditions.',
  description:
    'Formula 1 carbon brake discs are engineered to operate at extreme temperatures while maintaining consistent braking performance during heavy deceleration.',
  technicalDetails: {
    weight: 'Approximately 1 kg per disc',
    materialSpec: 'Carbon-carbon aerospace composite',
    temperature: '1000°C+ operating temperature',
    efficiency: '5G braking capability'
  },
defaultOffset: {
  cameraPosition: [3.5, 1.2, 2.5],
  target: [1.5, 0.5, 1.5]
},
explodeVector: [1.2, 0, 0.8]
},


'brake-caliper': {
  id: 'brake-caliper',
  title: 'Brembo Carbon Brake Caliper',
  category: 'Suspension',
  material: 'Aluminium Lithium Alloy',
  purpose:
    'Applies hydraulic pressure to clamp brake pads against the carbon disc.',
  description:
    'Ultra lightweight six piston brake calipers designed specifically for extreme F1 braking forces.',
  technicalDetails: {
    weight: 'Lightweight racing specification',
    materialSpec: 'Machined aluminium alloy',
    temperature: 'High thermal resistance'
  },
  defaultOffset: {
    cameraPosition: [2.5, 1, 2],
    target: [1, 0.5, 1.5]
  },
  explodeVector: [1.3, 0, 1]
},


'brake-duct': {
  id: 'brake-duct',
  title: 'Brake Cooling Duct System',
  category: 'Cooling',
  material: 'Carbon Fibre Composite',
  purpose:
    'Directs cooling airflow toward brake components.',
  description:
    'Aerodynamic brake ducts maintain optimal brake temperatures while minimizing aerodynamic disturbance.',
  technicalDetails: {
    efficiency: 'Temperature regulation system',
    materialSpec: 'Lightweight carbon composite'
  },
  defaultOffset: {
    cameraPosition: [2, 0.8, 2],
    target: [1, 0.3, 1]
  },
  explodeVector: [1, 0, 0.8]
},


'front-wheel': {
  id: 'front-wheel',
  title: 'Front Wheel Assembly',
  category: 'Chassis',
  material: 'Forged Magnesium Alloy',
  purpose:
    'Transfers steering input and braking forces to the track surface.',
  description:
    'Lightweight forged wheel designed to reduce unsprung mass and improve handling response.',
  technicalDetails: {
    weight: 'Approximately 9.5 kg',
    materialSpec: 'AZ80 Magnesium Alloy',
    efficiency: 'Low rotational inertia'
  },
defaultOffset: {
  cameraPosition: [4, 1.8, 3],
  target: [-3.5,-2.0,1.5]
},
explodeVector:[1.8,0,1]
},


'rear-wheel': {
  id: 'rear-wheel',
  title: 'Rear Wheel Assembly',
  category: 'Chassis',
  material: 'Forged Magnesium Alloy',
  purpose:
    'Transfers hybrid power unit torque to the circuit surface.',
  description:
    'Rear wheel system optimized for maximum traction during acceleration.',
  technicalDetails: {
    weight: 'Approximately 11.5 kg',
    materialSpec: 'Forged magnesium construction',
    efficiency: 'High torque transmission'
  },
defaultOffset:{
  cameraPosition:[-4,1.8,-3],
  target:[-1,-1.5,-1]
},
explodeVector:[-1.5,0,-1]
},


'tyres': {
  id: 'tyres',
  title: 'Pirelli 18 Inch F1 Tyres',
  category: 'Chassis',
  material: 'Advanced Synthetic Racing Compound',
  purpose:
    'Provides mechanical grip and transfers aerodynamic load into traction.',
  description:
    'Specialized racing tyres engineered for extreme temperatures and high cornering forces.',
  technicalDetails: {
    weight: 'Front: 9.5 kg / Rear: 11.5 kg',
    materialSpec: 'Synthetic rubber compound',
    temperature: 'Optimal operating window 90-110°C',
    efficiency: '5G lateral acceleration capability'
  },
defaultOffset:{
 cameraPosition:[4,2,3],
 target:[1.2,0.5,1.5]
},
explodeVector:[1.5,0,1]
},


'wheel-cover': {
  id: 'wheel-cover',
  title: 'Aerodynamic Wheel Cover',
  category: 'Aerodynamics',
  material: 'Carbon Fibre Composite',
  purpose:
    'Controls airflow around rotating wheels.',
  description:
    'Wheel covers reduce turbulent airflow generated by rotating tyres and improve aerodynamic efficiency.',
  technicalDetails: {
    downforce: 'Improves aerodynamic consistency',
    materialSpec: 'Lightweight carbon composite'
  },
  defaultOffset: {
    cameraPosition: [3, 1, 2],
    target: [1.5, 0.5, 1.5]
  },
  explodeVector: [1.6, 0, 0.8]
},


'cockpit': {
  id: 'cockpit',
  title: 'Driver Cockpit System',
  category: 'Safety',
  material: 'Carbon Fibre Survival Structure',
  purpose:
    'Provides driver protection and controls vehicle operation.',
  description:
    'The cockpit integrates steering wheel controls, seat, safety systems and driver interfaces.',
  technicalDetails: {
    materialSpec: 'Carbon fibre survival cell',
    efficiency: 'FIA safety compliant'
  },
defaultOffset:{
 cameraPosition:[0,2.5,3],
 target:[0,1,0]
},
explodeVector:[0,0.8,0]
},


'steering-wheel': {
  id: 'steering-wheel',
  title: 'Formula 1 Steering Wheel',
  category: 'Electronics',
  material: 'Carbon Fibre, OLED Display and Electronics',
  purpose:
    'Allows the driver to control vehicle systems while driving.',
  description:
    'Advanced multifunction steering wheel containing switches for engine modes, brake balance, differential and hybrid deployment.',
  technicalDetails: {
    weight: 'Approximately 1.3 kg',
    materialSpec: 'Carbon fibre composite',
    efficiency: 'Real-time vehicle management'
  },
defaultOffset:{
 cameraPosition:[0,1.8,2],
 target:[0,0.9,0]
},
explodeVector:[0,0.5,0]
},


'fuel-system': {
  id: 'fuel-system',
  title: 'Fuel Cell System',
  category: 'Powertrain',
  material: 'Kevlar Reinforced Flexible Fuel Cell',
  purpose:
    'Stores and supplies fuel to the combustion engine.',
  description:
    'A safety-focused fuel system positioned inside the survival cell area.',
  technicalDetails: {
    materialSpec: 'Kevlar reinforced bladder',
    efficiency: 'Optimized fuel delivery'
  },
defaultOffset:{
 cameraPosition:[-2,1.5,-2],
 target:[0,0.5,-0.5]
},
explodeVector:[0,0.5,-0.5]
},


'hydraulic-system': {
  id: 'hydraulic-system',
  title: 'Hydraulic Control System',
  category: 'Powertrain',
  material: 'High Pressure Hydraulic Components',
  purpose:
    'Controls gearbox, suspension and aerodynamic systems.',
  description:
    'A compact hydraulic network responsible for operating critical vehicle mechanisms.',
  technicalDetails: {
    efficiency: 'High pressure precision control',
    materialSpec: 'Aerospace hydraulic components'
  },
  defaultOffset: {
    cameraPosition: [-1, 1, -2],
    target: [0, 0.5, -1]
  },
  explodeVector: [0.5, 0, -0.5]
},

'shark-fin': {
 id:'shark-fin',
 title:'Engine Cover Shark Fin',
 category:'Aerodynamics',
 material:'Carbon Fibre Composite',
 purpose:'Improves airflow stability toward the rear wing.',
 description:
 'Vertical aerodynamic structure mounted on the engine cover that stabilizes airflow during high-speed cornering.',
 technicalDetails:{
   downforce:'Improves rear aerodynamic consistency',
   materialSpec:'High modulus carbon fibre'
 },
defaultOffset:{
 cameraPosition:[0,2.5,-3],
 target:[0,1,0]
},
explodeVector:[0,1,0]
},


'cockpit-system':{
 id:'cockpit-system',
 title:'Driver Cockpit Assembly',
 category:'Safety',
 material:'Carbon Fibre Survival Cell',
 purpose:'Driver protection and vehicle control interface.',
 description:
 'The cockpit contains the driver seating position, steering system and FIA safety structures.',
 technicalDetails:{
   materialSpec:'Carbon fibre monocoque'
 },
 defaultOffset:{
   cameraPosition:[0,2,2],
   target:[0,0.8,0]
 },
 explodeVector:[0,0.5,0]
},


'suspension':{
 id:'suspension',
 title:'Double Wishbone Suspension',
 category:'Suspension',
 material:'Carbon Fibre Composite',
 purpose:'Controls wheel movement and maintains tyre contact.',
 description:
 'High precision suspension arms designed for maximum aerodynamic efficiency.',
 technicalDetails:{
   materialSpec:'Carbon fibre wishbones'
 },
 defaultOffset:{
   cameraPosition:[2,1,2],
   target:[1,0.5,1]
 },
 explodeVector:[1,0,1]
},


'brake-light':{
 id:'brake-light',
 title:'Rear Rain Light',
 category:'Safety',
 material:'LED High Intensity Light',
 purpose:'Improves visibility in wet race conditions.',
 description:
 'FIA mandated rear flashing light used during rain and low visibility races.',
 technicalDetails:{
   efficiency:'High brightness LED'
 },
 defaultOffset:{
   cameraPosition:[0,1,-4],
   target:[0,0.5,-2]
 },
 explodeVector:[0,0,-0.5]
},
'mirrors': {
 id:'mirrors',
 title:'Aerodynamic Rear View Mirrors',
 category:'Aerodynamics',
 material:'Carbon Fibre Composite',
 purpose:'Provides rear visibility while minimizing aerodynamic disturbance.',
 description:
 'Small aerodynamic mirror housings designed to reduce turbulence around the cockpit.',
 technicalDetails:{
   materialSpec:'Carbon fibre composite'
 },
defaultOffset:{
 cameraPosition:[2.5,1.8,2.5],
 target:[0.8,0.9,0]
},
explodeVector:[1,0,0]
},

'engine-bay':{
 id:'engine-bay',
 title:'Formula 1 Engine Bay Assembly',
 category:'Powertrain',
 material:'Carbon Fibre Heat Shielding + Titanium Components',
 purpose:'Houses the power unit, turbo system, cooling and hybrid components.',
 description:
 'The engine bay contains the 1.6L V6 turbo hybrid power unit, exhaust routing, cooling systems and electrical components.',
 technicalDetails:{
   performance:'1000+ HP hybrid system',
   temperature:'1000°C+ thermal environment',
   materialSpec:'Aerospace grade materials'
 },
defaultOffset:{
 cameraPosition:[0,2,-4],
 target:[0,0.8,-1]
},
explodeVector:[0,1,-1]
},




}

/**
 * Intelligent GLB mesh name mapping utility.
 * Takes any mesh name from the GLB scene graph and maps it to a canonical F1 car part.
 */
export function findCarPartByMeshName(meshName: string): CarPartData {
  const name = meshName
    .toLowerCase()
    .replace(/[\s\-_]/g, "");

  // =====================================================
  // FRONT WING
  // =====================================================
  if (
    name.includes("plane00285")
  ) {
    return CAR_PARTS["front-wing"];
  }

  // =====================================================
  // NOSE
  // =====================================================

    if (
    name.includes("safetycell215")
  ) {
    return CAR_PARTS["nose"];
  }
 

  // =====================================================
  // REAR WING
  // =====================================================
  if (
    name.includes("plane005213")
  ) {
    return CAR_PARTS["rear-wing"];
  }


    // =====================================================
  //  DRS
  // =====================================================
  if (
    name.includes("modex26")
  ) {
    return CAR_PARTS["drs"];
  }

  // =====================================================
  // SHARK FIN
  // =====================================================
  if (name.includes("mirror0021")) {
    return CAR_PARTS["shark-fin"];
  }

  // =====================================================
  // SIDEPODS
  // =====================================================
  if (
    name.includes("Cube29")
  ) {
    return CAR_PARTS["sidepods"];
  }

  // =====================================================
  // FLOOR
  // =====================================================
  if (
    name.includes("plane017") ||
    name.includes("plane018") ||
    name.includes("plane019") ||
    name.includes("plane020") ||
    name.includes("plane021") ||
    name.includes("plane022") ||
    name.includes("plane023") ||
    name.includes("plane024") ||
    name.includes("plane025") ||
    name.includes("plane026") ||
    name.includes("plane027") ||
    name.includes("plane028") ||
    name.includes("plane029") ||
    name.includes("plane030") ||
    name.includes("plane031") ||
    name.includes("plane032")
  ) {
    return CAR_PARTS["floor"];
  }

  // =====================================================
  // DIFFUSER
  // =====================================================
  if (
    name.includes("plane033") ||
    name.includes("plane034") ||
    name.includes("plane035") ||
    name.includes("plane036") ||
    name.includes("plane037") ||
    name.includes("plane038") ||
    name.includes("plane039") ||
    name.includes("plane040") ||
    name.includes("plane041") ||
    name.includes("plane042") ||
    name.includes("plane043") ||
    name.includes("plane044") ||
    name.includes("plane045") ||
    name.includes("plane046") ||
    name.includes("plane047") ||
    name.includes("plane048") ||
    name.includes("plane049") ||
    name.includes("plane050") ||
    name.includes("plane051") ||
    name.includes("plane052") ||
    name.includes("plane053") ||
    name.includes("plane054") ||
    name.includes("plane055") ||
    name.includes("plane056") ||
    name.includes("plane057") ||
    name.includes("plane058") ||
    name.includes("plane059") ||
    name.includes("plane060") ||
    name.includes("plane061") ||
    name.includes("plane062") ||
    name.includes("plane063") ||
    name.includes("plane064") ||
    name.includes("plane065") ||
    name.includes("plane066") ||
    name.includes("plane067") ||
    name.includes("plane002") ||
    name.includes("plane004")
  ) {
    return CAR_PARTS["diffuser"];
  }

  // =====================================================
  // COCKPIT
  // =====================================================
  if (
    name.includes("cockpit") ||
    name.includes("headrest216") ||
    name.includes("windscreen")
  ) {
    return CAR_PARTS["cockpit"];
  }

  // =====================================================
  // HALO
  // =====================================================
  if (
    name.includes("cinture") ||
    name.includes("halo")
  ) {
    return CAR_PARTS["halo"];
  }

  // =====================================================
  // STEERING
  // =====================================================
  if (
    name.includes("steerhr211") ||
    name.includes("steerpivot")
  ) {
    return CAR_PARTS["steering-wheel"];
  }

  // =====================================================
  // MIRRORS
  // =====================================================
  if (
    name.includes("cube00391")
  ) {
    return CAR_PARTS["mirrors"];
  }

  // =====================================================
  // FRONT SUSPENSION
  // =====================================================
  if (
    name.includes("susrodrf100") ||
    name.includes("susrodrf")
  ) {
    return CAR_PARTS["front-suspension"];
  }

  // =====================================================
  // REAR SUSPENSION
  // =====================================================
  if (
    name.includes("susp452") ||
    name.includes("susrodrr")
  ) {
    return CAR_PARTS["rear-suspension"];
  }

  // =====================================================
  // FRONT WHEEL
  // =====================================================
  if (
    name.includes("wheellf60") ||
    name.includes("wheelrf60") ||
    name.includes("wheelfl60") ||
    name.includes("wheelfr60") ||
    name.includes("tyrelf60") ||
    name.includes("tyrerf60")
  ) {
    return CAR_PARTS["front-wheel"];
  }

  // =====================================================
  // REAR WHEEL
  // =====================================================
  if (
    name.includes("wheellr117") ||
    name.includes("wheelrr117") ||
    name.includes("wheelbl117") ||
    name.includes("wheelbr117") ||
    name.includes("tyrerl117") ||
    name.includes("tyrerr117")
  ) {
    return CAR_PARTS["rear-wheel"];
  }

  // =====================================================
  // BRAKES
  // =====================================================
  if (
    name.includes("susprf259")
  ) {
    return CAR_PARTS["brake-disc"];
  }

  // =====================================================
  // EXHAUST
  // =====================================================
  if (name.includes("safetycell016235")) {
    return CAR_PARTS["exhaust"];
  }

    // =====================================================
  // REAR SUSPENSION
  // =====================================================
  if (
    name.includes("susp3107")
  ) {
    return CAR_PARTS["brake-light"];
  }

      // =====================================================
  // monocoque
  // =====================================================
  if (
    name.includes("cockpit00262")
  ) {
    return CAR_PARTS["monocoque"];
  }

        // =====================================================
  // engine
  // =====================================================
  if (
    name.includes("plane01867")
  ) {
    return CAR_PARTS["engine"];
  }

        // =====================================================
  // turbo
  // =====================================================
  if (
    name.includes("plane01867")
  ) {
    return CAR_PARTS["turbo"];
  }


        // =====================================================
  // mgu-k
  // =====================================================
  if (
    name.includes("plane01867")
  ) {
    return CAR_PARTS["mgu-k"];
  }



        // =====================================================
  // battery
  // =====================================================
  if (
    name.includes("plane01867")
  ) {
    return CAR_PARTS["battery"];
  }


        // =====================================================
  // ecu
  // =====================================================
  if (
    name.includes("plane01867")
  ) {
    return CAR_PARTS["ecu"];
  }

  
        // =====================================================
  // tyres
  // =====================================================
  if (
    name.includes("wheelrf45")
  ) {
    return CAR_PARTS["tyre"];
  }

    // =====================================================
  // DEFAULT FALLBACK
  // =====================================================
  return CAR_PARTS["nose"];




}