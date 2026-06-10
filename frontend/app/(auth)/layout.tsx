import { SplineScene } from "@/components/ui/splite";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#080808'}}>
      {/* Left: form */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'#080808', padding:'48px 24px'}}>
        <div style={{width:'100%', maxWidth:'380px'}}>{children}</div>
      </div>

      {/* Right: Spline robot */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', background:'#080808', overflow:'hidden'}}>
        {/* Heading top */}
        <div style={{padding:'40px 40px 0', textAlign:'center'}}>
          <h2 style={{fontSize:'24px', fontWeight:'600', color:'#ffffff', margin:'0 0 8px'}}>
            Chat that keeps your team in flow.
          </h2>
          <p style={{fontSize:'14px', color:'#555', margin:0}}>
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot */}
        <div style={{position:'relative', width:'100%', height:'480px', marginTop:'16px'}}>
          <SplineScene scene={SCENE_URL} className="h-full w-full" />
          <div style={{
            position:'absolute',
            inset:0,
            background:'rgba(8,8,8,0.3)',
            pointerEvents:'none'
          }}/>
        </div>
      </div>
    </div>
  );
}