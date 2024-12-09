import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";


const Downbar = () => {
	const queryClient = useQueryClient();
    const {mutate:logoutfn,isPending,isError,error} = useMutation({
		mutationFn : async()=>{
			try {
				const res = await fetch(`${baseUrl}/api/auth/logout`,{
					method : "POST",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json",
						"Accept" : "application/json"
					}
				})
				const data = await res.json()
				if(!res.json){
					throw new Error(data.error || "Something went wrong")
				}
				if(data.error){
					return null
				}
				return data
			} catch (error) {
				throw error
			}
		},
		onSuccess : ()=>{
			toast.success("Log out successfully");
			queryClient.invalidateQueries({
				queryKey : ["authUser"]
			})
		}
	})

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });


	return (
		<div className='md:hidden fixed bottom-0 left-0 w-full bg-black'>
			<div className='flex flex-row justify-center items-center border-t border-gray-700 w-full py-2 px-4'>

				<ul className='flex flex-row justify-between gap-3'>
					<li className='flex justify-center'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
						</Link>
					</li>

					<li className='flex justify-center'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-7 h-7' />
						</Link>
					</li>

					<li className='flex justify-center'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
						</Link>
					</li>

					<li>
						{authUser && (
							<Link
								to={`/profile/${authUser?.username}`}
								className='flex items-center transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
							>
								<BiLogOut className='w-7 h-7 cursor-pointer'
									onClick={(e) => {
										e.preventDefault();
										logoutfn();
									}} />
							</Link>
						)}
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Downbar;
