import React from 'react'

export const Test = () => {
  return (
    <div>
      	<div
		className="text-stone-950 leading-[1.5] gap-y-20 gap-x-12 grid-cols-5 font-[inter,_sans-serif] grid text-center items-center py-16">
		<div className="pr-8 col-span-2">
			<div className="text-left">
				<h2
					className="mb-4 text-white leading-[1.33333] tracking-[-0.6px] text-2xl font-medium">
					Select the Component Tool</h2>
				<p className="text-zinc-300">That's one click</p>
			</div>
		</div>
		<div className="order-[2] col-span-3">
			<img alt="Select the tool" width="0" height="0"
				className="text-transparent w-full max-w-none aspect-[auto_0_/_0] rounded-[18px]"
				src="https://placehold.co/100" />
		</div>
	</div>
    </div>
  )
}
