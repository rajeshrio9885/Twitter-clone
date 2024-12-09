import { useEffect, useRef, useState } from "react";
import {  Link,useNavigate, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import useFollow from "../../hooks/useFollow"
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import { profileDate } from "../../utils/date/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";


const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);
	const { username } = useParams()
	const { data: authUser } = useQuery({ queryKey: ["authUser"] })

	const { data: user, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["userProfile"],
		queryFn: async () => {
			try {
				const res = await fetch(`${baseUrl}/api/user/getuser/${username}`,
					{
						method: "GET",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
					}
				)
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		}
	})
	const QueryClient = useQueryClient()
	const [set, seter] = useState("")
	const { mutate: update, isPending: isUpdateProfile } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${baseUrl}/api/user/profileupdate`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						coverImg,
						profileImg
					})
				})
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully")
			Promise.all([
				QueryClient.invalidateQueries({ queryKey: ["authUser"] }),
				QueryClient.invalidateQueries({ queryKey: ["userProfile"] })])
			setCoverImg("")
			setProfileImg("")
		},
		onError: (error) => {
			toast.error(error.message)
		}

	})
	const navigate = useNavigate()
	const { mutate: updateBio, isPending: isUpdateBio } = useMutation({
		mutationFn: async ({ fullName, bio, link, username, currentPassword, newPassword }) => {
			try {
				seter(username)
				console.log(set)
				const res = await fetch(`${baseUrl}/api/user/profileupdate`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						fullName, bio, link, username, currentPassword, newPassword
					})
				})
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully")
			navigate(`/profile/${set || authUser?.username}`)
			Promise.all([
				QueryClient.invalidateQueries({ queryKey: ["authUser"] }),
				QueryClient.invalidateQueries({ queryKey: ["userProfile"] })])
			

		},
		onError: (error) => {
			toast.error(error.message)
		}

	})
	const {data:postLen} = useQuery({queryKey : ["post"]})
	
	const isMyProfile = authUser._id === user?._id;
	const date = profileDate(user?.createdAt)
	const { follow, isPending } = useFollow()
	const amIfollow = authUser?.following.includes(user?._id)
	useEffect(() => {
		refetch()
	}, [username, refetch, amIfollow, isUpdateBio, updateBio])

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};
	return (
		<>
			<div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
				{/* HEADER */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !user && !isRefetching && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && user && !isRefetching && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>Post</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative group/cover'>
								<img
									src={coverImg || user?.coverImg || "/posts/cover.png"}
									className='h-52 w-full object-cover'
									alt='cover image'
								/>
								{isMyProfile && (
									<div
										className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
										onClick={() => coverImgRef.current.click()}
									>
										<MdEdit className='w-5 h-5 text-white' />
									</div>
								)}

								<input
									type='file'
									hidden
									ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "coverImg")}
								/>
								<input
									type='file'
									hidden
									ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImg")}
								/>
								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img src={profileImg || user?.profileImg || "/avatars/avatar-placeholder.png"} />
										<div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
											{isMyProfile && (
												<MdEdit
													className='w-4 h-4 text-white'
													onClick={() => profileImgRef.current.click()}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && <EditProfileModal updateBio={updateBio} />}
								{!isMyProfile && (
									<button style={{ backgroundColor: `${(!isMyProfile && !amIfollow) ? "rgb(29, 161, 242)" : ""}` }}
										className='btn btn-outline rounded-full btn-sm'
										onClick={() => {
											follow(user?._id)
										}

										}
									>
										{(!isMyProfile && !isPending && !amIfollow) && "follow"}
										{(!isMyProfile && isPending) && <LoadingSpinner size="sm" />}
										{(!isMyProfile && !isPending && amIfollow) && "unfollow"}
									</button>
								)}

								{(coverImg || profileImg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={() => {
											update()

										}}
									>
										{isUpdateProfile ? <LoadingSpinner size="sm" /> : "Update"}

									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user?.fullName}{user?.bluetick && <span ><RiVerifiedBadgeFill style={{ color: "rgb(29,161,242)", marginLeft: "3px", display: "inline" }} /></span>}</span>
									<span className='text-sm text-slate-500'>@{user?.username || username}</span>
									<span className='text-sm my-1'>{user?.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user?.link && (
										<div className='flex gap-1 items-center '>
											<>
												<FaLink className='w-3 h-3 text-slate-500' />
												<a
													href={user?.link}
													target='_blank'
													rel='noreferrer'
													className='text-sm text-blue-500 hover:underline'
												>
													{user?.link}
												</a>
											</>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>Joined  {date}</span>
									</div>
								</div>
								{/* following */}
								<div className='flex gap-2'>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.following.length}</span>
										<span className='flex gap-1 items-center cursor-pointer group text-slate-500 text-xs'
											onClick={() => document.getElementById("following_modal").showModal()} >Following</span>
									</div>

									<dialog id={`following_modal`} className='modal border-none outline-none'>
										<div style={{ width: "250px" }} className='modal-box rounded border border-gray-600'>
											<h3 className='font-bold text-lg mb-4'>Following</h3>
											<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
												{user?.following.length === 0 && (
													<p className='text-sm text-slate-500'>
														No one following yet
													</p>
												)}
												{user?.following.map((userone, index) => (
													<div key={index} className='flex gap-5 items-start'>
														<Link to={`/profile/${userone?.username}`}>
													<div style={{display:"flex",gap:"5px 10px"}}>
															<div className='avatar' style={{marginTop:"6px"}}>
																<div className='w-8 rounded-full'>
																	<img 
																		src={userone?.profileImg || "/avatars/avatar-placeholder.png"}
																	/>
																</div>
															</div>
															<div className='flex flex-col'>
																<div style={{display:"flex",flexDirection:"column",height:"14px"}}  className='flex items-center'>
																	<span className='font-bold'>{userone?.fullName}{userone?.bluetick && <img style={{ width: "10px", height: "10px", borderRadius: "10px", display: "inline", marginLeft: "4px" }} src="/posts/blue.png" />}</span>
																	<span className='text-gray-700 text-sm'>
																		@{userone?.username}
																	</span>
																</div>
													</div>
															</div>
														</Link>
													</div>

												))}
											</div>
										</div>
										<form method='dialog' className='modal-backdrop'>
											<button className='outline-none text-pink-500'>close</button>
										</form>
									</dialog>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.followers.length}</span>
										<span className='flex gap-1 items-center cursor-pointer group text-slate-500 text-xs'
											onClick={() => document.getElementById("followers_modal").showModal()} >Followers</span>
										<dialog id={`followers_modal`}  className='modal border-none outline-none'>
											<div style={{ width: "250px" }} className='modal-box rounded border border-gray-600'>
												<h3 className='font-bold text-lg mb-4'>Followers</h3>
												<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
													{user?.followers.length === 0 && (
														<p className='text-sm text-slate-500'>
															No one followers yet
														</p>
													)}
													{user?.followers.map((userone, index) => (
														<div key={index} style={{paddingBottom:"10px"}} className='flex gap-2 items-start'>
															<Link to={`/profile/${userone?.username}`}>
															<div style={{display:"flex",gap:"0 10px"}}>
																<div className='avatar' style={{height:"35px",width:"35px"}}>
																	<div className='w-8 rounded-full'>
																		<img
																			src={userone?.profileImg || "/avatars/avatar-placeholder.png"}
																		/>
																	</div>
																</div>
																<div className='flex flex-col'>
																	<div style={{display:"flex",flexDirection:"column"}} className='flex items-center'>
																		<span className='font-bold'>{userone?.fullName}{userone?.bluetick && <img style={{ width: "10px", height: "10px", borderRadius: "10px", display: "inline", marginLeft: "4px" }} src="/posts/blue.png" />}</span>
																		<span className='text-gray-700 text-sm'>
																			@{userone?.username}
																		</span>
																	</div>
																</div>
															</div>
															</Link>
														</div>
													))}
												</div>
											</div>
											<form method='dialog' className='modal-backdrop'>
												<button className='outline-none text-pink-500'>close</button>
											</form>
										</dialog>

									</div>
								</div>
							</div>
							<div className='flex w-full border-b border-gray-700 mt-4'>
								<div
									className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("posts")}
								>
									Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("likes")}
								>
									Likes
									{feedType === "likes" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					<Posts feedType={feedType} username={username} userid={user?._id} />
				</div>
			</div>
		</>
	);
};
export default ProfilePage;