import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "../common/LoadingSpinner"
import {useQuery} from "@tanstack/react-query"
import {baseUrl} from "../../constant/url"
import useFollow from "../../hooks/useFollow";
import { RiVerifiedBadgeFill } from "react-icons/ri";
const RightPanel = () => {

	const {data:suggest,isLoading} = useQuery({
		queryKey : ["followers"],
		queryFn : async()=>{
			try {
				const res = await fetch(`${baseUrl}/api/user/suggested`,{
					method : "GET",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					},
				})
				const data = await res.json()
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		}
	})
	const {follow,isPending} = useFollow()
	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggest.suggestUser?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatars/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
											{user.bluetick && <span ><RiVerifiedBadgeFill style={{color:"rgb(29,161,242)",marginLeft:"3px",display:"inline"}} /></span>}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={
											(e) => {
												e.preventDefault()
												follow(user._id)
											}

										}
									>
										{isPending? <LoadingSpinner/> : "Follow" }
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;