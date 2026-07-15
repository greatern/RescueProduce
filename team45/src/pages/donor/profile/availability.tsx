import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

interface AvailabilitySlot {
	id: string;
	day: string;
	startTime: string;
	endTime: string;
}

const AvailabilityPage = () => {
	const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
	const [showAddAvailability, setShowAddAvailability] = useState(false);
	const [newAvailability, setNewAvailability] = useState({
		day: "Monday",
		startTime: "08:00",
		endTime: "17:00",
	});

	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	useEffect(() => {
		const mockAvailability: AvailabilitySlot[] = [
			{ id: "1", day: "Monday", startTime: "08:00", endTime: "12:00" },
			{ id: "2", day: "Wednesday", startTime: "13:00", endTime: "17:00" },
			{ id: "3", day: "Saturday", startTime: "09:00", endTime: "15:00" },
		];
		setAvailability(mockAvailability);
	}, []);

	const handleAddAvailability = () => {
		if (newAvailability.startTime >= newAvailability.endTime) {
			alert("End time must be after start time");
			return;
		}

		const hasOverlap = availability.some(
			(slot) =>
				slot.day === newAvailability.day &&
				((newAvailability.startTime >= slot.startTime &&
					newAvailability.startTime < slot.endTime) ||
					(newAvailability.endTime > slot.startTime &&
						newAvailability.endTime <= slot.endTime) ||
					(newAvailability.startTime <= slot.startTime &&
						newAvailability.endTime >= slot.endTime))
		);

		if (hasOverlap) {
			alert("This time slot overlaps with an existing availability");
			return;
		}

		const newSlot = {
			id: Date.now().toString(),
			...newAvailability,
		};
		setAvailability([...availability, newSlot]);
		setShowAddAvailability(false);
		setNewAvailability({
			day: "Monday",
			startTime: "08:00",
			endTime: "17:00",
		});
	};

	const handleRemoveAvailability = (id: string) => {
		setAvailability(availability.filter((slot) => slot.id !== id));
	};

	return (
		<div className="bg-white shadow overflow-hidden sm:rounded-lg">
			<div className="px-4 py-5 sm:px-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						Volunteer Availability
					</h3>
					<button
						onClick={() =>
							setShowAddAvailability(!showAddAvailability)
						}
						className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
						{showAddAvailability ? (
							<>
								<X className="h-4 w-4 mr-1" />
								Cancel
							</>
						) : (
							<>
								<Calendar className="h-4 w-4 mr-1" />
								Add Availability
							</>
						)}
					</button>
				</div>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					Set your available times for food rescue pickups
				</p>
			</div>

			<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
				{showAddAvailability && (
					<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
						<h4 className="text-md font-medium text-gray-900 mb-4">
							Add New Availability Slot
						</h4>
						<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
							<div className="sm:col-span-2">
								<label
									htmlFor="day"
									className="block text-sm font-medium text-gray-700">
									Day
								</label>
								<select
									id="day"
									className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
									value={newAvailability.day}
									onChange={(e) =>
										setNewAvailability({
											...newAvailability,
											day: e.target.value,
										})
									}>
									{daysOfWeek.map((day) => (
										<option key={day} value={day}>
											{day}
										</option>
									))}
								</select>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="startTime"
									className="block text-sm font-medium text-gray-700">
									Start Time
								</label>
								<input
									type="time"
									id="startTime"
									className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
									value={newAvailability.startTime}
									onChange={(e) =>
										setNewAvailability({
											...newAvailability,
											startTime: e.target.value,
										})
									}
								/>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="endTime"
									className="block text-sm font-medium text-gray-700">
									End Time
								</label>
								<input
									type="time"
									id="endTime"
									className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
									value={newAvailability.endTime}
									onChange={(e) =>
										setNewAvailability({
											...newAvailability,
											endTime: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={handleAddAvailability}
								className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
								Add Slot
							</button>
						</div>
					</div>
				)}
				<div className="px-4 py-5 sm:px-6">
					{availability.length > 0 ? (
						<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
							<table className="min-w-full divide-y divide-gray-300">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
											Day
										</th>
										<th
											scope="col"
											className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Start Time
										</th>
										<th
											scope="col"
											className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											End Time
										</th>
										<th
											scope="col"
											className="relative py-3.5 pl-3 pr-4 sm:pr-6">
											<span className="sr-only">
												Remove
											</span>
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									{availability.map((slot) => (
										<tr key={slot.id}>
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
												{slot.day}
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
												{slot.startTime}
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
												{slot.endTime}
											</td>
											<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
												<button
													onClick={() =>
														handleRemoveAvailability(
															slot.id
														)
													}
													className="text-red-600 hover:text-red-900">
													Remove
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-8">
							<Calendar className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No availability set
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Add your available times to start receiving
								pickup assignments.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AvailabilityPage;
