import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {baseUrl} from "../../constant/url"
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa6";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import { FaRegCommentDots } from "react-icons/fa";
import {toast} from "react-hot-toast"
const NotificationPage = () => {
	
	const {data:notifications,isLoading} = useQuery({
		queryKey : ["notification"],
		queryFn : async()=>{
			try {
				const res = await fetch(`${baseUrl}/api/notification`,{
					method : "GET",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json",
						"Accept" : "application/json"
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
	const queryClient = useQueryClient()
	const {mutate:deletefn} = useMutation({
		mutationFn : async()=>{
			try {
				const res = await fetch(`${baseUrl}/api/notification`,{
					method : "DELETE",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json",
						"Accept" : "application/json"
					}
				})
				const data = await res.json()
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		},
		onSuccess : ()=>{
			toast.success("Notifications deleted successfully!")
			queryClient.invalidateQueries({queryKey:["notification"]})
		}
	})
	const deleteNotifications = () => {
		deletefn()
	};

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul	style={{right:"-1px "}}
							tabIndex={0}
							className='dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-45'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							{notification.type === "comment" && <FaRegCommentDots className="w-7 h-7 text-blue-500"/> }
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div style={{width:"40px"}} className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatars/avatar-placeholder.png"} />
									</div>
									<span style={{display:"inline"}} className='font-bold ml-2 mt-1'>{notification.from.fullName} {notification.from.bluetick && <span ><RiVerifiedBadgeFill style={{color:"rgb(29,161,242)",marginLeft:"3px",display:"inline"}} /></span>}</span>
								</div>
								
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" :notification.type === "like" ? "liked your post":"comment on your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;